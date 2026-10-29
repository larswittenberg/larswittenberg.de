import Database from 'better-sqlite3';
import { ACTIVITY_METRIC_COLUMNS, STRAVA_DB_FILE } from '@/lib/strava/schema';
import { isAuthenticated } from '@/lib/strava/session';
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

function openDb() {
	// Relative to the project root (process.cwd()); bundled via outputFileTracingIncludes.
	return new Database(STRAVA_DB_FILE, { readonly: true, fileMustExist: true });
}

export type StravaTotals = {
	count: number;
	distance: number;
	elevation: number;
	movingTime: number;
	firstYear: string | null;
};

/** Public: aggregate values only. */
export function getActivityTotals(): StravaTotals {
	const db = openDb();
	try {
		return db
			.prepare(
				`SELECT COUNT(*) AS count,
					COALESCE(SUM(distance), 0) AS distance,
					COALESCE(SUM(total_elevation_gain), 0) AS elevation,
					COALESCE(SUM(moving_time), 0) AS movingTime,
					strftime('%Y', MIN(start_date)) AS firstYear
				FROM activities`,
			)
			.get() as StravaTotals;
	} finally {
		db.close();
	}
}

/** Protected: throws without a valid session. */
export async function getActivities(): Promise<StravaActivityListItem[]> {
	if (!(await isAuthenticated())) throw new Error('Unauthorized');
	const db = openDb();
	try {
		return db
			.prepare(`SELECT ${LIST_COLUMNS.join(', ')} FROM activities ORDER BY start_date DESC`)
			.all() as StravaActivityListItem[];
	} finally {
		db.close();
	}
}
