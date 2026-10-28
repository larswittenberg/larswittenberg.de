import Database from 'better-sqlite3';
import { STRAVA_DB_FILE } from '@/lib/strava/schema';

export type StravaActivityListItem = {
	id: number;
	name: string;
	sport_type: string;
	start_date: string;
	distance: number | null;
	moving_time: number | null;
	total_elevation_gain: number | null;
	elapsed_time: number | null;
	average_speed: number | null;
	max_speed: number | null;
	average_watts: number | null;
	calories: number | null;
	average_heartrate: number | null;
	max_heartrate: number | null;
	gear_name: string | null;
	description: string | null;
};

export function getActivities(): StravaActivityListItem[] {
	// Relative to the project root (process.cwd()); bundled via outputFileTracingIncludes.
	const db = new Database(STRAVA_DB_FILE, { readonly: true, fileMustExist: true });
	try {
		return db
			.prepare(
				`SELECT id, name, sport_type, start_date, distance, moving_time, total_elevation_gain,
					elapsed_time, average_speed, max_speed, average_watts, calories,
					average_heartrate, max_heartrate, gear_name, description
				FROM activities
				ORDER BY start_date DESC`,
			)
			.all() as StravaActivityListItem[];
	} finally {
		db.close();
	}
}
