/**
 * Reads the start coordinates from the export activity files (.fit/.gpx/.tcx, optionally .gz) into
 * src/data/strava.db (start_lat/start_lng, rounded to COORDINATE_DECIMALS). Local only, no API requests.
 * Activities without GPS (indoor, manual) stay NULL and are checked again on the next run.
 *
 * Usage:
 *   yarn strava:start-location [--dry-run] [--limit N] [--force] [--export-dir PATH] [--db PATH]
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { COORDINATE_DECIMALS, STRAVA_DB_FILE } from '../src/lib/strava/schema';
import { errorMessage, fail, parsePositiveInt } from './lib/strava-api/cli';
import { hasColumn, openStravaDb } from './lib/strava-api/db';
import { fileFormat, readStartLocation } from './lib/start-location';

const PROGRESS_EVERY = 250;

const { values: args } = parseArgs({
	options: {
		'dry-run': { type: 'boolean', default: false },
		limit: { type: 'string' },
		force: { type: 'boolean', default: false },
		'export-dir': { type: 'string', default: 'data/strava-export' },
		db: { type: 'string', default: STRAVA_DB_FILE },
	},
});

const dryRun = args['dry-run'];
const limit = parsePositiveInt('--limit', args.limit);
const dbPath = path.resolve(args.db);
const activitiesDir = path.resolve(args['export-dir'], 'activities');

if (!fs.existsSync(dbPath)) fail(`DB nicht gefunden: ${dbPath} – zuerst "yarn strava:import" ausführen.`);
if (!fs.existsSync(activitiesDir)) fail(`Ordner nicht gefunden: ${activitiesDir} – Strava-Export dort ablegen oder --export-dir angeben.`);

type ActivityRef = { id: number; name: string; sport_type: string; start_date: string; filename: string };

function main() {
	const db = openStravaDb(dbPath, { readonly: dryRun });
	// A dry run must not migrate the schema, so the location columns may still be missing.
	const hasLocationColumns = hasColumn(db, 'start_lat');

	const where = ['length(filename) > 0'];
	if (!args.force && hasLocationColumns) where.push('start_lat IS NULL');
	const rows = db
		.prepare(
			`SELECT id, name, sport_type, start_date, filename FROM activities
			WHERE ${where.join(' AND ')}
			ORDER BY start_date DESC${limit ? ' LIMIT ?' : ''}`,
		)
		.all(...(limit ? [limit] : [])) as ActivityRef[];

	console.log(`DB: ${dbPath}`);
	console.log(`Export: ${activitiesDir}`);
	console.log(`Zu prüfen: ${rows.length} Aktivitäten (Koordinaten gerundet auf ${COORDINATE_DECIMALS} Nachkommastellen)\n`);

	const update = dryRun ? null : db.prepare('UPDATE activities SET start_lat = ?, start_lng = ? WHERE id = ?');

	const stats = { found: 0, noGps: 0, missing: 0, unsupported: 0, failed: 0 };
	const sample: Record<string, unknown>[] = [];

	const run = db.transaction(() => {
		for (const [i, row] of rows.entries()) {
			const label = `${row.start_date.slice(0, 10)} ${row.sport_type} "${row.name}" (${row.filename})`;
			const file = path.join(activitiesDir, row.filename);

			if (!fileFormat(row.filename)) {
				stats.unsupported++;
				console.warn(`  ! ${label}: Dateiformat nicht unterstützt`);
			} else if (!fs.existsSync(file)) {
				stats.missing++;
				console.warn(`  ! ${label}: Datei fehlt`);
			} else {
				try {
					const { start_lat, start_lng } = readStartLocation(file);
					if (start_lat === null) stats.noGps++;
					else {
						stats.found++;
						update?.run(start_lat, start_lng, row.id);
					}
					if (dryRun && sample.length < 20) {
						sample.push({
							id: row.id,
							date: row.start_date.slice(0, 10),
							type: row.sport_type,
							name: row.name.slice(0, 40),
							file: row.filename,
							start_lat,
							start_lng,
						});
					}
				} catch (err) {
					stats.failed++;
					console.warn(`  ! ${label}: ${errorMessage(err)}`);
				}
			}
			if ((i + 1) % PROGRESS_EVERY === 0) console.log(`  ${i + 1}/${rows.length} …`);
		}
	});
	run();

	if (dryRun) {
		console.log('\nDry run – nichts geschrieben. Stichprobe:');
		if (sample.length) console.table(sample);
	}
	console.log(
		`\nMit Koordinaten: ${stats.found}, ohne GPS: ${stats.noGps}, Datei fehlt: ${stats.missing}, nicht unterstützt: ${stats.unsupported}, Fehler: ${stats.failed}`,
	);
	if (!dryRun && stats.found > 0) console.log('src/data/strava.db committen und deployen.');
	db.close();
	if (stats.failed > 0) process.exitCode = 1;
}

try {
	main();
} catch (err) {
	console.error(errorMessage(err));
	process.exit(1);
}
