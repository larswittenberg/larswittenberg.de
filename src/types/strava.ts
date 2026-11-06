import type { ActivityMetricColumn } from '../lib/strava/schema';

// Field names mirror the Strava API (snake_case) so API data can be stored without mapping changes.
export type StravaActivitySource = 'export' | 'api';

/** Units: see ACTIVITY_METRIC_COLUMNS in src/lib/strava/schema.ts */
export type StravaActivityMetrics = Record<ActivityMetricColumn, number | null>;

export interface StravaActivity extends StravaActivityMetrics {
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
	/** activity file in the export's activities/ folder, e.g. "12345.fit.gz"; null for API imports */
	filename: string | null;
	commute: boolean;
	source: StravaActivitySource;
}

export type StravaApiStatus = 'ok' | 'not_found';

/** Columns filled only via the Strava API (see ACTIVITY_API_COLUMNS); all null for rows not yet enriched. */
export interface StravaActivityApiFields {
	/** raw API sport_type, e.g. "GravelRide" */
	api_sport_type: string | null;
	device_name: string | null;
	workout_type: number | null;
	trainer: boolean | null;
	visibility: string | null;
	external_id: string | null;
	gear_id: string | null;
	start_date_local: string | null;
	timezone: string | null;
	/** ISO 8601, UTC */
	api_synced_at: string | null;
	api_status: StravaApiStatus | null;
}

/** Start coordinates in degrees, rounded to COORDINATE_DECIMALS; null without GPS or not yet extracted. */
export interface StravaActivityLocation {
	start_lat: number | null;
	start_lng: number | null;
}

/** Row shape as stored in SQLite (booleans as 0/1). */
export type StravaActivityRow = Omit<StravaActivity, 'commute'> & {
	commute: 0 | 1;
	imported_at: string;
};
