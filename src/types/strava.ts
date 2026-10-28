// Field names mirror the Strava API (snake_case) so API data can be stored without mapping changes.
export type StravaActivitySource = 'export' | 'api';

export interface StravaActivity {
	id: number;
	name: string;
	sport_type: string;
	/** ISO 8601, UTC */
	start_date: string;
	description: string | null;
	/** meters */
	distance: number | null;
	/** seconds */
	moving_time: number | null;
	/** seconds */
	elapsed_time: number | null;
	/** meters */
	total_elevation_gain: number | null;
	/** m/s */
	average_speed: number | null;
	/** m/s */
	max_speed: number | null;
	average_heartrate: number | null;
	max_heartrate: number | null;
	average_watts: number | null;
	calories: number | null;
	gear_name: string | null;
	commute: boolean;
	source: StravaActivitySource;
}

/** Row shape as stored in SQLite (booleans as 0/1). */
export type StravaActivityRow = Omit<StravaActivity, 'commute'> & {
	commute: 0 | 1;
	imported_at: string;
};
