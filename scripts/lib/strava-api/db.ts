import Database from 'better-sqlite3';
import {
	ACTIVITY_API_COLUMNS,
	ACTIVITY_EXTRA_COLUMNS,
	ACTIVITY_METRIC_COLUMNS,
	CREATE_ACTIVITIES_TABLE,
	type ActivityApiColumn,
	type ActivityMetricColumn,
} from '../../../src/lib/strava/schema';

export const METRIC_KEYS = Object.keys(ACTIVITY_METRIC_COLUMNS) as ActivityMetricColumn[];

export const API_COLUMNS = Object.keys(ACTIVITY_API_COLUMNS) as ActivityApiColumn[];

// Written by the export import; API columns are deliberately excluded so a re-import keeps them.
export const BASE_COLUMNS = [
	'id', 'name', 'sport_type', 'start_date', 'description', 'distance', 'moving_time', 'elapsed_time',
	'total_elevation_gain', 'average_speed', 'max_speed', 'average_heartrate', 'max_heartrate',
	'average_watts', 'calories', 'gear_name', 'filename', ...METRIC_KEYS, 'commute', 'source',
];

export function ensureSchema(db: Database.Database) {
	db.exec(CREATE_ACTIVITIES_TABLE);
	const existing = new Set((db.prepare('PRAGMA table_info(activities)').all() as { name: string }[]).map((c) => c.name));
	const optionalColumns: Record<string, string> = { ...ACTIVITY_EXTRA_COLUMNS, ...ACTIVITY_METRIC_COLUMNS };
	for (const [key, type] of Object.entries(optionalColumns)) {
		if (existing.has(key)) continue;
		db.exec(`ALTER TABLE activities ADD COLUMN ${key} ${type}`);
		console.log(`  + added column ${key}`);
	}
}

/** Read-only connections skip the migration and require an existing file. */
export function openStravaDb(file: string, { readonly = false } = {}) {
	const db = new Database(file, { readonly, fileMustExist: readonly });
	if (!readonly) ensureSchema(db);
	return db;
}

export function hasColumn(db: Database.Database, column: string) {
	return (db.prepare('PRAGMA table_info(activities)').all() as { name: string }[]).some((c) => c.name === column);
}

/** SQLite has no booleans. */
export function toDbParams(record: object): Record<string, unknown> {
	const params: Record<string, unknown> = { ...(record as Record<string, unknown>) };
	for (const key of ['commute', 'trainer']) {
		if (typeof params[key] === 'boolean') params[key] = params[key] ? 1 : 0;
	}
	return params;
}
