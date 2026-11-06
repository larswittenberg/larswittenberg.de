/**
 * Fetches new activities from the Strava API into src/data/strava.db (source = 'api').
 * Non-interactive and CI-ready: exit code 0 also for "nothing new" and rate-limit stops.
 *
 * Usage:
 *   yarn strava:sync [--dry-run] [--since YYYY-MM-DD | --days N] [--overlap-days 3] [--limit N]
 *                    [--update-existing] [--no-details] [--no-wait] [--db PATH]
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { STRAVA_DB_FILE } from '../src/lib/strava/schema';
import {
	EnvTokenStore,
	NotFoundError,
	configureClient,
	formatRateLimit,
	getActivity,
	getAthlete,
	getTokenStore,
	isCI,
	listActivities,
	loadEnv,
} from './lib/strava-api/client';
import { errorMessage, fail, isRateLimitStop, parseDate, parsePositiveInt } from './lib/strava-api/cli';
import { API_COLUMNS, BASE_COLUMNS, hasColumn, openStravaDb, toDbParams } from './lib/strava-api/db';
import { toActivityRecord, type ApiActivityRecord } from './lib/strava-api/map-activity';
import type { SummaryActivity } from './lib/strava-api/types';

const DAY_S = 24 * 60 * 60;

const { values: args } = parseArgs({
	options: {
		'dry-run': { type: 'boolean', default: false },
		since: { type: 'string' },
		days: { type: 'string' },
		'overlap-days': { type: 'string', default: '3' },
		limit: { type: 'string' },
		'update-existing': { type: 'boolean', default: false },
		'no-details': { type: 'boolean', default: false },
		'no-wait': { type: 'boolean', default: false },
		db: { type: 'string', default: STRAVA_DB_FILE },
	},
});

const dryRun = args['dry-run'];
const noDetails = args['no-details'];
const updateExisting = args['update-existing'];
const since = parseDate('--since', args.since);
const days = parsePositiveInt('--days', args.days);
const overlapDays = parsePositiveInt('--overlap-days', args['overlap-days'])!;
const limit = parsePositiveInt('--limit', args.limit);
const dbPath = path.resolve(args.db);

if (since && days) fail('--since und --days nicht gleichzeitig verwenden.');
if (dryRun && !fs.existsSync(dbPath)) fail(`DB nicht gefunden: ${dbPath}`);

type Stats = { found: number; new: number; updated: number; skipped: number; notFound: number };

function writeCiOutputs(stats: Stats, stopReason: string | null) {
	const changed = !dryRun && stats.new + stats.updated > 0;
	const store = getTokenStore();
	const rotated = store instanceof EnvTokenStore && store.refreshTokenRotated;

	const summaryFile = process.env.GITHUB_STEP_SUMMARY;
	if (summaryFile) {
		const rows = [
			['Gefunden', stats.found],
			['Neu', stats.new],
			['Aktualisiert', stats.updated],
			['Übersprungen', stats.skipped],
			['Nicht gefunden', stats.notFound],
		];
		const md = [
			`### Strava-Sync${dryRun ? ' (Dry Run)' : ''}`,
			'',
			'| | Anzahl |',
			'| --- | ---: |',
			...rows.map(([label, n]) => `| ${label} | ${n} |`),
			'',
			formatRateLimit(),
			stopReason ? `\n> Gestoppt: ${stopReason}` : '',
			rotated ? '\n> **Refresh-Token wurde rotiert – Secret `STRAVA_REFRESH_TOKEN` aktualisieren.**' : '',
			'',
		].join('\n');
		fs.appendFileSync(summaryFile, md);
	}

	const outputFile = process.env.GITHUB_OUTPUT;
	if (outputFile) {
		fs.appendFileSync(outputFile, `new_count=${dryRun ? 0 : stats.new}\nchanged=${changed}\nrefresh_token_rotated=${rotated}\n`);
	}
}

async function main() {
	loadEnv();
	configureClient({ wait: !args['no-wait'] && !isCI });

	const db = openStravaDb(dbPath, { readonly: dryRun });
	const hasApiColumns = hasColumn(db, 'api_synced_at');

	let after: number;
	if (since) after = Date.parse(`${since}T00:00:00Z`) / 1000;
	else if (days) after = Math.floor(Date.now() / 1000) - days * DAY_S;
	else {
		const { latest } = db.prepare('SELECT MAX(start_date) AS latest FROM activities').get() as { latest: string | null };
		if (!latest) fail('Keine Aktivitäten in der DB – Zeitraum mit --since oder --days angeben.');
		after = Math.floor(Date.parse(latest) / 1000) - overlapDays * DAY_S;
	}
	console.log(`DB: ${dbPath}`);
	console.log(`Hole Aktivitäten ab ${new Date(after * 1000).toISOString().slice(0, 10)} …`);

	const findExisting = db.prepare(
		`SELECT id, ${hasApiColumns ? 'api_synced_at' : 'NULL AS api_synced_at'} FROM activities WHERE id = ?`,
	);
	const insertColumns = [...BASE_COLUMNS, ...API_COLUMNS];
	const insert = dryRun
		? null
		: db.prepare(
				`INSERT INTO activities (${insertColumns.join(', ')}) VALUES (${insertColumns.map((c) => `@${c}`).join(', ')})`,
			);
	const apiSet = API_COLUMNS.map((c) => `${c} = @${c}`).join(', ');
	const updateApi = dryRun ? null : db.prepare(`UPDATE activities SET ${apiSet} WHERE id = @id`);
	const updateWithDetails = dryRun
		? null
		: db.prepare(
				`UPDATE activities SET name = @name, sport_type = @sport_type, description = @description,
				commute = @commute, gear_name = @gear_name, ${apiSet} WHERE id = @id`,
			);
	const updateFromSummary = dryRun
		? null
		: db.prepare(
				`UPDATE activities SET name = @name, sport_type = @sport_type, commute = @commute,
				gear_name = COALESCE(@gear_name, gear_name) WHERE id = @id`,
			);

	let gearNames: Map<string, string> | null = null;
	const resolveGearName = async (gearId: string | null | undefined) => {
		if (!gearId) return null;
		if (!gearNames) {
			const athlete = await getAthlete();
			gearNames = new Map([...(athlete.bikes ?? []), ...(athlete.shoes ?? [])].map((g) => [g.id, g.name]));
			if (gearNames.size === 0) console.warn('Hinweis: /athlete liefert keine Ausrüstung – gear_name bleibt leer.');
		}
		return gearNames.get(gearId) ?? null;
	};
	const warned = new Set<string>();
	const onUnknownSportType = (raw: string) => {
		if (warned.has(raw)) return;
		warned.add(raw);
		console.warn(`Unbekannter Sport-Typ "${raw}" – Rohwert gespeichert, ggf. API_SPORT_TYPES ergänzen.`);
	};
	const toRecord = async (summary: SummaryActivity, syncedAt: string | null): Promise<ApiActivityRecord | null> => {
		if (!syncedAt) {
			return toActivityRecord(summary, { gearName: await resolveGearName(summary.gear_id), syncedAt, onUnknownSportType });
		}
		try {
			const detail = await getActivity(summary.id);
			return toActivityRecord(detail, {
				gearName: detail.gear ? null : await resolveGearName(detail.gear_id),
				syncedAt,
				onUnknownSportType,
			});
		} catch (err) {
			if (err instanceof NotFoundError) return null;
			throw err;
		}
	};

	const stats: Stats = { found: 0, new: 0, updated: 0, skipped: 0, notFound: 0 };
	const planned: Record<string, unknown>[] = [];
	let stopReason: string | null = null;

	try {
		const summaries: SummaryActivity[] = [];
		for await (const summary of listActivities({ after })) summaries.push(summary);
		summaries.sort((a, b) => a.start_date.localeCompare(b.start_date));
		stats.found = summaries.length;

		let newProcessed = 0;
		for (const summary of summaries) {
			const existing = findExisting.get(summary.id) as { id: number; api_synced_at: string | null } | undefined;
			const isNew = !existing;
			if (isNew && limit && newProcessed >= limit) {
				stats.skipped++;
				continue;
			}
			const needsApiData = !noDetails && !!existing && existing.api_synced_at === null;
			if (!isNew && !updateExisting && !needsApiData) {
				stats.skipped++;
				continue;
			}

			if (dryRun) {
				if (isNew) {
					newProcessed++;
					stats.new++;
					planned.push({
						id: summary.id,
						date: summary.start_date.slice(0, 10),
						type: summary.sport_type,
						name: summary.name.slice(0, 40),
						km: summary.distance ? +(summary.distance / 1000).toFixed(2) : null,
					});
				} else stats.updated++;
				continue;
			}

			const syncedAt = noDetails ? null : new Date().toISOString();
			const record = await toRecord(summary, syncedAt);
			if (!record) {
				stats.notFound++;
				continue;
			}
			const params = toDbParams(record);
			if (isNew) {
				newProcessed++;
				insert!.run(params);
				stats.new++;
			} else if (updateExisting) {
				(noDetails ? updateFromSummary : updateWithDetails)!.run(params);
				stats.updated++;
			} else {
				updateApi!.run(params);
				stats.updated++;
			}
		}
	} catch (err) {
		if (!isRateLimitStop(err)) throw err;
		stopReason = err.message;
	}

	if (dryRun) {
		console.log('\nDry run – nichts geschrieben.');
		if (planned.length) console.table(planned);
	}
	console.log(
		`\nGefunden: ${stats.found}, neu: ${stats.new}, aktualisiert: ${stats.updated}, übersprungen: ${stats.skipped}, nicht gefunden: ${stats.notFound}`,
	);
	console.log(formatRateLimit());
	if (stopReason) console.log(`Gestoppt: ${stopReason} Erneut ausführen setzt fort.`);
	if (!dryRun && stats.new + stats.updated > 0) console.log('src/data/strava.db committen und deployen.');
	writeCiOutputs(stats, stopReason);
	db.close();
}

main().catch((err) => {
	console.error(errorMessage(err));
	process.exit(1);
});
