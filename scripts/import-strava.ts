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
import type { StravaActivity, StravaActivityMetrics } from '../src/types/strava';
import {
	ACTIVITY_METRIC_COLUMNS,
	CREATE_ACTIVITIES_TABLE,
	STRAVA_DB_FILE,
	type ActivityMetricColumn,
} from '../src/lib/strava/schema';

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

// Strava localizes the export to the account language; German headers are mapped to the English ones used below.
const HEADER_DE: Record<string, string> = {
	'Aktivitäts-ID': 'Activity ID',
	Aktivitätsdatum: 'Activity Date',
	'Name der Aktivität': 'Activity Name',
	Aktivitätsart: 'Activity Type',
	Aktivitätsbeschreibung: 'Activity Description',
	'Verstrichene Zeit': 'Elapsed Time',
	Distanz: 'Distance',
	'Max. Herzfrequenz': 'Max Heart Rate',
	'Relative Leistung': 'Relative Effort',
	Pendeln: 'Commute',
	Aktivitätsausrüstung: 'Activity Gear',
	Sportlergewicht: 'Athlete Weight',
	Fahrradgewicht: 'Bike Weight',
	Bewegungszeit: 'Moving Time',
	'Höchstgeschw.': 'Max Speed',
	'Durchschnittliche Geschwindigkeit': 'Average Speed',
	Höhenzunahme: 'Elevation Gain',
	Höhenunterschied: 'Elevation Loss',
	'Min. Höhe': 'Elevation Low',
	'Max. Höhe': 'Elevation High',
	'Max. Steigung': 'Max Grade',
	'Durchschnittliche Steigung': 'Average Grade',
	'Max. Tritt-/Schrittfrequenz': 'Max Cadence',
	'Durchschnittliche Trittfrequenz': 'Average Cadence',
	'Durchschnittliche Herzfrequenz': 'Average Heart Rate',
	'Durchschnittliche Watt': 'Average Watts',
	Kalorien: 'Calories',
	'Durchschnittliche Temperatur': 'Average Temperature',
	Gesamtarbeit: 'Total Work',
	'Gefühlte Anstrengung': 'Perceived Exertion',
	'Gewichtete durchschnittliche Leistung': 'Weighted Average Power',
	'Auf Steigung angepasste Distanz': 'Grade Adjusted Distance',
	Wetterlage: 'Weather Condition',
	'Wetter: Temperatur': 'Weather Temperature',
	'Scheinbare Temperatur': 'Apparent Temperature',
	Luftfeuchtigkeit: 'Humidity',
	'Wetter: Druck': 'Weather Pressure',
	Windgeschwindigkeit: 'Wind Speed',
	Windböe: 'Wind Gust',
	Windrichtung: 'Wind Bearing',
	Niederschlagsintensität: 'Precipitation Intensity',
	Niederschlagswahrscheinlichkeit: 'Precipitation Probability',
	Wolkendecke: 'Cloud Cover',
	'UV-Index': 'UV Index',
	'Auf Schotter zurückgelegte Distanz': 'Dirt Distance',
	'Schritte insgesamt': 'Total Steps',
	Trainingsbelastung: 'Training Load',
	Intensität: 'Intensity',
	'Durchschnittliches auf Steigung angepasstes Tempo': 'Average Grade Adjusted Pace',
};

// German activity types -> English types stored in the DB (and used by dashboard filters/charts).
const ACTIVITY_TYPE_DE: Record<string, string> = {
	Lauf: 'Run',
	Spaziergang: 'Walk',
	Wandern: 'Hike',
	Radfahrt: 'Ride',
	'E-Bike-Radfahrt': 'E-Bike Ride',
	'Virtuelle Radfahrt': 'Virtual Ride',
	Training: 'Workout',
	Yoga: 'Yoga',
	'Kajak fahren': 'Kayaking',
	Kanu: 'Canoe',
};

type ExportLocale = 'en' | 'de';

const MONTHS: Record<string, string> = {
	Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
	Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
};

/**
 * "Sep 21, 2026, 11:10:33 AM" or "21.09.2026, 11:10:33" (both UTC) -> "2026-09-21T11:10:33Z"
 */
function parseStravaDate(value: string): string {
	const pad = (n: number | string) => String(n).padStart(2, '0');

	const de = value.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4}),? (\d{1,2}):(\d{2}):(\d{2})$/);
	if (de) {
		const [, day, month, year, h, min, sec] = de;
		return `${year}-${pad(month)}-${pad(day)}T${pad(h)}:${min}:${sec}Z`;
	}

	const m = value.trim().match(/^(\w{3}) (\d{1,2}), (\d{4}),? (\d{1,2}):(\d{2}):(\d{2}) (AM|PM)$/);
	if (!m || !MONTHS[m[1]]) throw new Error(`Unparseable date "${value}"`);
	const [, mon, day, year, h, min, sec, ampm] = m;
	let hour = Number(h) % 12;
	if (ampm === 'PM') hour += 12;
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

// CSV header (or getter) per metric column; empty-only CSV columns (Max Watts, Max Temperature, Newly Explored Distance) are skipped.
const METRIC_SOURCES: Record<ActivityMetricColumn, string | ((row: CsvRow) => number | null)> = {
	elevation_loss: 'Elevation Loss',
	elev_low: 'Elevation Low',
	elev_high: 'Elevation High',
	max_grade: 'Max Grade',
	average_grade: 'Average Grade',
	average_cadence: 'Average Cadence',
	max_cadence: 'Max Cadence',
	weighted_average_watts: 'Weighted Average Power',
	kilojoules: (row) => {
		const joules = num(row['Total Work']);
		return joules === null ? null : joules / 1000;
	},
	relative_effort: (row) => num(row['Relative Effort#2']) ?? num(row['Relative Effort']),
	training_load: 'Training Load',
	intensity: 'Intensity',
	perceived_exertion: 'Perceived Exertion',
	average_temp: 'Average Temperature',
	weather_condition: 'Weather Condition',
	weather_temperature: 'Weather Temperature',
	apparent_temperature: 'Apparent Temperature',
	humidity: 'Humidity',
	wind_speed: 'Wind Speed',
	wind_gust: 'Wind Gust',
	wind_bearing: 'Wind Bearing',
	cloud_cover: 'Cloud Cover',
	precipitation_intensity: 'Precipitation Intensity',
	precipitation_probability: 'Precipitation Probability',
	weather_pressure: 'Weather Pressure',
	uv_index: 'UV Index',
	average_grade_adjusted_speed: 'Average Grade Adjusted Pace',
	grade_adjusted_distance: 'Grade Adjusted Distance',
	total_steps: 'Total Steps',
	dirt_distance: 'Dirt Distance',
	athlete_weight: 'Athlete Weight',
	bike_weight: 'Bike Weight',
};

const METRIC_KEYS = Object.keys(ACTIVITY_METRIC_COLUMNS) as ActivityMetricColumn[];

function toMetrics(row: CsvRow): StravaActivityMetrics {
	const metrics = {} as StravaActivityMetrics;
	for (const key of METRIC_KEYS) {
		const source = METRIC_SOURCES[key];
		const value = typeof source === 'string' ? num(row[source]) : source(row);
		metrics[key] = value !== null && ACTIVITY_METRIC_COLUMNS[key] === 'INTEGER' ? Math.round(value) : value;
	}
	return metrics;
}

// Duplicate CSV headers get a "#2" suffix; the second occurrence holds the detailed values (e.g. distance in meters).
function toActivity(row: CsvRow, locale: ExportLocale): StravaActivity {
	const id = Number(row['Activity ID']);
	if (!Number.isSafeInteger(id) || id <= 0) throw new Error(`Invalid Activity ID "${row['Activity ID']}"`);

	const name = text(row['Activity Name']);
	const rawType = text(row['Activity Type']);
	if (!name) throw new Error('Missing Activity Name');
	if (!rawType) throw new Error('Missing Activity Type');
	const sportType = locale === 'de' ? ACTIVITY_TYPE_DE[rawType] : rawType;
	if (!sportType) throw new Error(`Unknown German activity type "${rawType}" - add it to ACTIVITY_TYPE_DE`);

	// Only the km column uses a locale decimal separator ("6,16" in German exports).
	const kmToMeters = (value: string | undefined) => {
		const km = num(value?.replace(',', '.'));
		return km !== null ? km * 1000 : null;
	};

	return {
		id,
		name,
		sport_type: sportType,
		start_date: parseStravaDate(row['Activity Date']),
		description: text(row['Activity Description']),
		distance: num(row['Distance#2']) ?? kmToMeters(row['Distance']),
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
		...toMetrics(row),
		commute: row['Commute'] === 'true',
		source: 'export',
	};
}

function readCsv(file: string): Promise<{ rows: CsvRow[]; headers: string[]; locale: ExportLocale }> {
	const seen = new Map<string, number>();
	const headers: string[] = [];
	let locale: ExportLocale = 'en';
	return new Promise((resolve, reject) => {
		const rows: CsvRow[] = [];
		fs.createReadStream(file)
			.pipe(
				csv({
					mapHeaders: ({ header }) => {
						const raw = header.replace(/^\uFEFF/, '').trim();
						if (HEADER_DE[raw]) locale = 'de';
						const clean = HEADER_DE[raw] ?? raw;
						const count = (seen.get(clean) ?? 0) + 1;
						seen.set(clean, count);
						const key = count === 1 ? clean : `${clean}#${count}`;
						headers.push(key);
						return key;
					},
				}),
			)
			.on('data', (row: CsvRow) => rows.push(row))
			.on('end', () => resolve({ rows, headers, locale }))
			.on('error', reject);
	});
}

const REQUIRED_HEADERS = [
	'Activity ID',
	'Activity Date',
	'Activity Name',
	'Activity Type',
	'Activity Description',
	'Distance#2',
	'Moving Time',
	'Elapsed Time#2',
	'Elevation Gain',
	'Average Speed',
	'Max Speed',
	'Average Heart Rate',
	'Max Heart Rate#2',
	'Average Watts',
	'Calories',
	'Activity Gear',
	'Commute',
	'Total Work',
	'Relative Effort#2',
	...Object.values(METRIC_SOURCES).filter((s): s is string => typeof s === 'string'),
];

function ensureSchema(db: Database.Database) {
	db.exec(CREATE_ACTIVITIES_TABLE);
	const existing = new Set((db.prepare('PRAGMA table_info(activities)').all() as { name: string }[]).map((c) => c.name));
	for (const key of METRIC_KEYS) {
		if (existing.has(key)) continue;
		db.exec(`ALTER TABLE activities ADD COLUMN ${key} ${ACTIVITY_METRIC_COLUMNS[key]}`);
		console.log(`  + added column ${key}`);
	}
}

async function main() {
	const { rows, headers, locale } = await readCsv(csvPath);

	const missingHeaders = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
	if (missingHeaders.length) {
		console.error(`Missing CSV columns (unknown export format/language?): ${missingHeaders.join(', ')}`);
		console.error(`CSV headers found: ${headers.slice(0, 10).join(', ')} ...`);
		process.exit(1);
	}

	const selected = limit ? rows.slice(0, limit) : rows;

	const activities: StravaActivity[] = [];
	const errors: string[] = [];
	selected.forEach((row, i) => {
		try {
			activities.push(toActivity(row, locale));
		} catch (err) {
			errors.push(`Row ${i + 2} (ID ${row['Activity ID'] ?? '?'}): ${(err as Error).message}`);
		}
	});

	console.log(`CSV: ${csvPath} (export language: ${locale})`);
	console.log(`Rows in CSV: ${rows.length}, processed: ${selected.length}, valid: ${activities.length}, invalid: ${errors.length}`);
	errors.forEach((e) => console.warn(`  ! ${e}`));

	const db = dryRun && !fs.existsSync(dbPath) ? null : new Database(dbPath, { readonly: dryRun });
	if (db && !dryRun) ensureSchema(db);

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
				down_m: a.elevation_loss,
				np_w: a.weighted_average_watts,
				kj: a.kilojoules !== null ? Math.round(a.kilojoules) : null,
				temp: a.weather_temperature,
			})),
		);
		db?.close();
		if (errors.length) process.exitCode = 1;
		return;
	}

	const columns = [
		'id', 'name', 'sport_type', 'start_date', 'description', 'distance', 'moving_time', 'elapsed_time',
		'total_elevation_gain', 'average_speed', 'max_speed', 'average_heartrate', 'max_heartrate',
		'average_watts', 'calories', 'gear_name', ...METRIC_KEYS, 'commute', 'source',
	];
	const upsert = db!.prepare(`
		INSERT INTO activities (${columns.join(', ')})
		VALUES (${columns.map((c) => `@${c}`).join(', ')})
		ON CONFLICT(id) DO UPDATE SET
			${columns
				.filter((c) => c !== 'id')
				.map((c) => `${c} = excluded.${c}`)
				.join(',\n\t\t\t')},
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
