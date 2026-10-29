import Database from 'better-sqlite3';
import { ACTIVITY_METRIC_COLUMNS, STRAVA_DB_FILE } from '@/lib/strava/schema';
import type { StravaActivity } from '@/types/strava';

export type StravaActivityListItem = Omit<StravaActivity, 'commute' | 'source'>;

const LIST_COLUMNS = [
	'id',
	'name',
	'sport_type',
	'start_date',
	'distance',
	'moving_time',
	'total_elevation_gain',
	'elapsed_time',
	'average_speed',
	'max_speed',
	'average_watts',
	'calories',
	'average_heartrate',
	'max_heartrate',
	'gear_name',
	'description',
	...Object.keys(ACTIVITY_METRIC_COLUMNS),
];

export function getActivities(): StravaActivityListItem[] {
	// Relative to the project root (process.cwd()); bundled via outputFileTracingIncludes.
	const db = new Database(STRAVA_DB_FILE, { readonly: true, fileMustExist: true });
	try {
		return db
			.prepare(`SELECT ${LIST_COLUMNS.join(', ')} FROM activities ORDER BY start_date DESC`)
			.all() as StravaActivityListItem[];
	} finally {
		db.close();
	}
}
