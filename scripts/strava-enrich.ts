/**
 * Enriches existing activities (from the export import) with Strava API data: device, workout type, trainer, ...
 * Every activity is committed immediately, so the script can be interrupted and resumed at any time.
 *
 * Usage:
 *   yarn strava:enrich [--dry-run] [--limit N] [--ids 1,2] [--since YYYY-MM-DD] [--until YYYY-MM-DD]
 *                      [--force] [--retry-not-found] [--fill-gaps] [--no-wait] [--db PATH]
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { STRAVA_DB_FILE } from '../src/lib/strava/schema';
import { getActivityTags } from '../src/lib/strava/activity-tags';
import {
	NotFoundError,
	configureClient,
	formatRateLimit,
	getActivity,
	getRateLimitState,
	isCI,
	loadEnv,
} from './lib/strava-api/client';
import { errorMessage, fail, isRateLimitStop, parseDate, parsePositiveInt } from './lib/strava-api/cli';
import { API_COLUMNS, hasColumn, openStravaDb, toDbParams } from './lib/strava-api/db';
import { toActivityRecord, toApiFields } from './lib/strava-api/map-activity';

const PROGRESS_EVERY = 25;

// Filled by --fill-gaps only where the column is NULL; existing (export) values are never overwritten.
const FILL_GAP_COLUMNS = [
	'description',
	'calories',
	'average_temp',
	'average_cadence',
	'elev_low',
	'elev_high',
	'weighted_average_watts',
	'kilojoules',
	'relative_effort',
	'average_heartrate',
	'max_heartrate',
	'average_watts',
	'average_speed',
	'max_speed',
	'gear_name',
] as const;

const { values: args } = parseArgs({
	options: {
		'dry-run': { type: 'boolean', default: false },
		limit: { type: 'string' },
		ids: { type: 'string' },
		since: { type: 'string' },
		until: { type: 'string' },
		force: { type: 'boolean', default: false },
		'retry-not-found': { type: 'boolean', default: false },
		'fill-gaps': { type: 'boolean', default: false },
		'no-wait': { type: 'boolean', default: false },
		db: { type: 'string', default: STRAVA_DB_FILE },
	},
});

const dryRun = args['dry-run'];
const limit = parsePositiveInt('--limit', args.limit);
const since = parseDate('--since', args.since);
const until = parseDate('--until', args.until);
const ids = args.ids
	?.split(',')
	.map((v) => v.trim())
	.filter(Boolean)
	.map((v) => {
		const id = Number(v);
		if (!Number.isSafeInteger(id) || id <= 0) fail(`Ungültige ID in --ids: ${v}`);
		return id;
	});
const dbPath = path.resolve(args.db);

if (!fs.existsSync(dbPath)) fail(`DB nicht gefunden: ${dbPath} – zuerst "yarn strava:import" ausführen.`);

type ActivityRef = { id: number; name: string; sport_type: string; start_date: string };

async function main() {
	loadEnv();
	configureClient({ wait: !args['no-wait'] && !isCI });

	const db = openStravaDb(dbPath, { readonly: dryRun });
	// A dry run must not migrate the schema, so the API columns may still be missing.
	const hasApiColumns = hasColumn(db, 'api_synced_at');

	const where: string[] = [];
	const params: (string | number)[] = [];
	if (ids?.length) {
		where.push(`id IN (${ids.map(() => '?').join(', ')})`);
		params.push(...ids);
	} else if (!args.force && hasApiColumns) {
		where.push(
			args['retry-not-found'] ? '(api_synced_at IS NULL OR api_status = \'not_found\')' : 'api_synced_at IS NULL',
		);
	}
	if (since) {
		where.push('start_date >= ?');
		params.push(since);
	}
	if (until) {
		where.push('start_date < date(?, \'+1 day\')');
		params.push(until);
	}
	if (limit) params.push(limit);
	const rows = db
		.prepare(
			`SELECT id, name, sport_type, start_date FROM activities
			${where.length ? `WHERE ${where.join(' AND ')}` : ''}
			ORDER BY start_date DESC${limit ? ' LIMIT ?' : ''}`,
		)
		.all(...params) as ActivityRef[];

	const countOpen = () =>
		(
			db
				.prepare(`SELECT COUNT(*) AS n FROM activities${hasApiColumns ? ' WHERE api_synced_at IS NULL' : ''}`)
				.get() as { n: number }
		).n;

	console.log(`DB: ${dbPath}`);
	console.log(`Noch nicht angereichert: ${countOpen()}, in diesem Lauf: ${rows.length} (1 Request je Aktivität)`);
	if (rows.length > 0) {
		console.log(`Bei ~1000 Read-Requests/Tag und 100 je 15 min dauert das ca. ${Math.ceil(rows.length / 1000)} Tag(e).\n`);
	}

	const apiSet = API_COLUMNS.map((c) => `${c} = @${c}`).join(', ');
	const update = dryRun ? null : db.prepare(`UPDATE activities SET ${apiSet} WHERE id = @id`);
	const fillGaps =
		dryRun || !args['fill-gaps']
			? null
			: db.prepare(
					`UPDATE activities SET ${FILL_GAP_COLUMNS.map((c) => `${c} = COALESCE(${c}, @${c})`).join(', ')} WHERE id = @id`,
				);
	const markNotFound = dryRun
		? null
		: db.prepare('UPDATE activities SET api_status = \'not_found\', api_synced_at = ? WHERE id = ?');

	const sample: Record<string, unknown>[] = [];
	let enriched = 0;
	let notFound = 0;
	let stopReason: string | null = null;

	for (const [i, row] of rows.entries()) {
		const prefix = `[${i + 1}/${rows.length}] ${row.start_date.slice(0, 10)} ${row.sport_type} "${row.name}"`;
		const syncedAt = new Date().toISOString();
		try {
			const detail = await getActivity(row.id);
			const api = toApiFields(detail, syncedAt);
			if (update) update.run(toDbParams({ id: row.id, ...api }));
			if (fillGaps) fillGaps.run(toDbParams(toActivityRecord(detail, { gearName: null, syncedAt })));
			enriched++;

			const tags = getActivityTags({ ...api, commute: detail.commute ?? null })
				.map((t) => t.label)
				.join(', ');
			console.log(
				`${prefix} → ${api.api_sport_type}, ${api.device_name ?? 'kein Gerät'}, workout_type ${api.workout_type ?? '–'}${tags ? ` [${tags}]` : ''}`,
			);
			if (dryRun) {
				sample.push({
					id: row.id,
					date: row.start_date.slice(0, 10),
					type: row.sport_type,
					name: row.name.slice(0, 40),
					api_sport_type: api.api_sport_type,
					device_name: api.device_name,
					workout_type: api.workout_type,
					trainer: api.trainer,
					tags,
				});
			}
		} catch (err) {
			if (err instanceof NotFoundError) {
				markNotFound?.run(syncedAt, row.id);
				notFound++;
				console.log(`${prefix} → nicht gefunden (gelöscht oder kein Zugriff)`);
			} else if (isRateLimitStop(err)) {
				stopReason = err.message;
				break;
			} else {
				throw err;
			}
		}
		if ((i + 1) % PROGRESS_EVERY === 0) console.log(`  ${formatRateLimit()}`);
	}

	if (dryRun && sample.length) {
		console.log('\nDry run – nichts geschrieben. Ergebnis:');
		console.table(sample);
	}

	const open = countOpen();
	console.log(`\nAngereichert: ${enriched}, nicht gefunden: ${notFound}, noch offen: ${open}`);
	console.log(formatRateLimit(getRateLimitState()));
	if (stopReason) console.log(`Gestoppt: ${stopReason} Erneut ausführen setzt nahtlos fort${open ? ' (weiter ab morgen bzw. im nächsten Fenster)' : ''}.`);
	if (!dryRun && enriched + notFound > 0) console.log('src/data/strava.db committen und deployen.');
	db.close();
}

main().catch((err) => {
	console.error(errorMessage(err));
	process.exit(1);
});
