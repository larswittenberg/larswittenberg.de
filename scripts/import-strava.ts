/**
 * Imports Strava activities from an export's activities.csv into SQLite.
 *
 * Usage:
 *   yarn strava:import [--dry-run] [--limit N] [--only-new] [--export-dir PATH] [--db PATH]
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import csv from 'csv-parser';
import Database from 'better-sqlite3';
import type { StravaActivity } from '../src/types/strava';
import { CREATE_ACTIVITIES_TABLE, STRAVA_DB_FILE } from '../src/lib/strava/schema';

const { values: args } = parseArgs({
	options: {
		'dry-run': { type: 'boolean', default: false },
		limit: { type: 'string' },
		'only-new': { type: 'boolean', default: false },
		'export-dir': { type: 'string', default: 'data/strava-export' },
		db: { type: 'string', default: STRAVA_DB_FILE },
	},
});

const dryRun = args['dry-run'];
const onlyNew = args['only-new'];
const limit = args.limit !== undefined ? Number(args.limit) : undefined;
const csvPath = path.resolve(args['export-dir'], 'activities.csv');
const dbPath = path.resolve(args.db);

if (limit !== undefined && (!Number.isInteger(limit) || limit <= 0)) {
	console.error(`Invalid --limit: ${args.limit}`);
	process.exit(1);
}
if (!fs.existsSync(csvPath)) {
	console.error(`CSV not found: ${csvPath}`);
	process.exit(1);
}

type CsvRow = Record<string, string>;

const MONTHS: Record<string, string> = {
	Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
	Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
};

/** "Sep 21, 2026, 11:10:33 AM" (UTC) -> "2026-09-21T11:10:33Z" */
function parseStravaDate(value: string): string {
	const m = value.trim().match(/^(\w{3}) (\d{1,2}), (\d{4}),? (\d{1,2}):(\d{2}):(\d{2}) (AM|PM)$/);
	if (!m || !MONTHS[m[1]]) throw new Error(`Unparseable date "${value}"`);
	const [, mon, day, year, h, min, sec, ampm] = m;
	let hour = Number(h) % 12;
	if (ampm === 'PM') hour += 12;
	const pad = (n: number | string) => String(n).padStart(2, '0');
	return `${year}-${MONTHS[mon]}-${pad(day)}T${pad(hour)}:${min}:${sec}Z`;
}

function num(value: string | undefined): number | null {
	if (value === undefined || value.trim() === '') return null;
	const n = Number(value);
	if (Number.isNaN(n)) throw new Error(`Not a number: "${value}"`);
	return n;
}

function int(value: string | undefined): number | null {
	const n = num(value);
	return n === null ? null : Math.round(n);
}

function text(value: string | undefined): string | null {
	const v = value?.trim();
	return v ? v : null;
}

// Duplicate CSV headers get a "#2" suffix; the second occurrence holds the detailed values (e.g. distance in meters).
function toActivity(row: CsvRow): StravaActivity {
	const id = Number(row['Activity ID']);
	if (!Number.isSafeInteger(id) || id <= 0) throw new Error(`Invalid Activity ID "${row['Activity ID']}"`);

	const name = text(row['Activity Name']);
	const sportType = text(row['Activity Type']);
	if (!name) throw new Error('Missing Activity Name');
	if (!sportType) throw new Error('Missing Activity Type');

	const distanceKm = num(row['Distance']);

	return {
		id,
		name,
		sport_type: sportType,
		start_date: parseStravaDate(row['Activity Date']),
		description: text(row['Activity Description']),
		distance: num(row['Distance#2']) ?? (distanceKm !== null ? distanceKm * 1000 : null),
		moving_time: int(row['Moving Time']),
		elapsed_time: int(row['Elapsed Time#2']) ?? int(row['Elapsed Time']),
		total_elevation_gain: num(row['Elevation Gain']),
		average_speed: num(row['Average Speed']),
		max_speed: num(row['Max Speed']),
		average_heartrate: num(row['Average Heart Rate']),
		max_heartrate: num(row['Max Heart Rate#2']) ?? num(row['Max Heart Rate']),
		average_watts: num(row['Average Watts']),
		calories: num(row['Calories']),
		gear_name: text(row['Activity Gear']),
		commute: row['Commute'] === 'true',
		source: 'export',
	};
}

function readCsv(file: string): Promise<CsvRow[]> {
	const seen = new Map<string, number>();
	return new Promise((resolve, reject) => {
		const rows: CsvRow[] = [];
		fs.createReadStream(file)
			.pipe(
				csv({
					mapHeaders: ({ header }) => {
						const clean = header.replace(/^\uFEFF/, '').trim();
						const count = (seen.get(clean) ?? 0) + 1;
						seen.set(clean, count);
						return count === 1 ? clean : `${clean}#${count}`;
					},
				}),
			)
			.on('data', (row: CsvRow) => rows.push(row))
			.on('end', () => resolve(rows))
			.on('error', reject);
	});
}

async function main() {
	const rows = await readCsv(csvPath);
	const selected = limit ? rows.slice(0, limit) : rows;

	const activities: StravaActivity[] = [];
	const errors: string[] = [];
	selected.forEach((row, i) => {
		try {
			activities.push(toActivity(row));
		} catch (err) {
			errors.push(`Row ${i + 2} (ID ${row['Activity ID'] ?? '?'}): ${(err as Error).message}`);
		}
	});

	console.log(`CSV: ${csvPath}`);
	console.log(`Rows in CSV: ${rows.length}, processed: ${selected.length}, valid: ${activities.length}, invalid: ${errors.length}`);
	errors.forEach((e) => console.warn(`  ! ${e}`));

	const db = dryRun && !fs.existsSync(dbPath) ? null : new Database(dbPath, { readonly: dryRun });
	if (db && !dryRun) db.exec(CREATE_ACTIVITIES_TABLE);

	const existingIds = new Set<number>();
	if (db && db.prepare('SELECT 1 FROM sqlite_master WHERE type = ? AND name = ?').get('table', 'activities')) {
		for (const { id } of db.prepare('SELECT id FROM activities').all() as { id: number }[]) existingIds.add(id);
	}

	const toWrite = onlyNew ? activities.filter((a) => !existingIds.has(a.id)) : activities;
	const newCount = activities.filter((a) => !existingIds.has(a.id)).length;
	console.log(`Mode: ${onlyNew ? 'only new' : 'upsert all'} -> ${toWrite.length} to write (${newCount} new, ${activities.length - newCount} already in DB)`);

	if (dryRun) {
		console.log('\nDry run - nothing written. Sample:');
		console.table(
			toWrite.slice(0, 10).map((a) => ({
				id: a.id,
				date: a.start_date,
				type: a.sport_type,
				name: a.name.slice(0, 40),
				km: a.distance !== null ? +(a.distance / 1000).toFixed(2) : null,
				hm: a.total_elevation_gain,
				moving_min: a.moving_time !== null ? Math.round(a.moving_time / 60) : null,
			})),
		);
		db?.close();
		if (errors.length) process.exitCode = 1;
		return;
	}

	const upsert = db!.prepare(`
		INSERT INTO activities (
			id, name, sport_type, start_date, description, distance, moving_time, elapsed_time,
			total_elevation_gain, average_speed, max_speed, average_heartrate, max_heartrate,
			average_watts, calories, gear_name, commute, source
		) VALUES (
			@id, @name, @sport_type, @start_date, @description, @distance, @moving_time, @elapsed_time,
			@total_elevation_gain, @average_speed, @max_speed, @average_heartrate, @max_heartrate,
			@average_watts, @calories, @gear_name, @commute, @source
		)
		ON CONFLICT(id) DO UPDATE SET
			name = excluded.name,
			sport_type = excluded.sport_type,
			start_date = excluded.start_date,
			description = excluded.description,
			distance = excluded.distance,
			moving_time = excluded.moving_time,
			elapsed_time = excluded.elapsed_time,
			total_elevation_gain = excluded.total_elevation_gain,
			average_speed = excluded.average_speed,
			max_speed = excluded.max_speed,
			average_heartrate = excluded.average_heartrate,
			max_heartrate = excluded.max_heartrate,
			average_watts = excluded.average_watts,
			calories = excluded.calories,
			gear_name = excluded.gear_name,
			commute = excluded.commute,
			source = excluded.source,
			imported_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
	`);

	const writeAll = db!.transaction((items: StravaActivity[]) => {
		for (const a of items) upsert.run({ ...a, commute: a.commute ? 1 : 0 });
	});
	writeAll(toWrite);

	const { total } = db!.prepare('SELECT COUNT(*) AS total FROM activities').get() as { total: number };
	console.log(`Written: ${toWrite.length}. Total activities in ${dbPath}: ${total}`);
	db!.close();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
