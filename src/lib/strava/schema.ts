export const STRAVA_DB_FILE = 'src/data/strava.db';

type ColumnType = 'REAL' | 'INTEGER' | 'TEXT';

// Nullable metric columns; added via ALTER TABLE when missing in an existing DB.
export const ACTIVITY_METRIC_COLUMNS = {
	elevation_loss: 'REAL', // m
	elev_low: 'REAL', // m
	elev_high: 'REAL', // m
	max_grade: 'REAL', // %
	average_grade: 'REAL', // %
	average_cadence: 'REAL', // rpm / spm
	max_cadence: 'REAL',
	weighted_average_watts: 'REAL', // W
	kilojoules: 'REAL', // kJ
	relative_effort: 'INTEGER',
	training_load: 'REAL',
	intensity: 'REAL', // %
	perceived_exertion: 'REAL', // 1-10
	average_temp: 'REAL', // °C, device sensor
	weather_condition: 'INTEGER', // undocumented Strava code 1-8
	weather_temperature: 'REAL', // °C
	apparent_temperature: 'REAL', // °C
	humidity: 'REAL', // 0-1
	wind_speed: 'REAL', // m/s
	wind_gust: 'REAL', // m/s
	wind_bearing: 'INTEGER', // degrees
	cloud_cover: 'REAL', // 0-1
	precipitation_intensity: 'REAL', // mm/h
	precipitation_probability: 'REAL', // 0-1
	weather_pressure: 'REAL', // hPa
	uv_index: 'INTEGER',
	average_grade_adjusted_speed: 'REAL', // m/s (CSV: "Average Grade Adjusted Pace")
	grade_adjusted_distance: 'REAL', // m
	total_steps: 'INTEGER',
	dirt_distance: 'REAL', // m
	athlete_weight: 'REAL', // kg
	bike_weight: 'REAL', // kg
} as const satisfies Record<string, ColumnType>;

export type ActivityMetricColumn = keyof typeof ACTIVITY_METRIC_COLUMNS;

// Written only by the API scripts (strava:enrich / strava:sync), never by the export import.
export const ACTIVITY_API_COLUMNS = {
	api_sport_type: 'TEXT', // raw API sport_type, e.g. "GravelRide"; sport_type keeps the export name ("Ride")
	device_name: 'TEXT', // e.g. "Garmin Edge 840", "Zwift"
	workout_type: 'INTEGER', // Run: 0-3, Ride: 10-12, see src/lib/strava/activity-tags.ts
	trainer: 'INTEGER', // 0/1, indoor
	visibility: 'TEXT', // everyone | followers_only | only_me
	external_id: 'TEXT', // original upload file name
	gear_id: 'TEXT',
	start_date_local: 'TEXT',
	timezone: 'TEXT',
	api_synced_at: 'TEXT', // ISO, UTC; last successful detail fetch
	api_status: 'TEXT', // ok | not_found
} as const satisfies Record<string, ColumnType>;

export type ActivityApiColumn = keyof typeof ACTIVITY_API_COLUMNS;

// Start coordinates, rounded to COORDINATE_DECIMALS (privacy: ignores Strava privacy zones).
// Written by strava:start-location (export files) and strava:sync (API), never by the export import.
export const ACTIVITY_LOCATION_COLUMNS = {
	start_lat: 'REAL', // degrees
	start_lng: 'REAL', // degrees
} as const satisfies Record<string, ColumnType>;

export type ActivityLocationColumn = keyof typeof ACTIVITY_LOCATION_COLUMNS;

/** 3 decimals ≈ 110 m (latitude); never store more precise start coordinates. */
export const COORDINATE_DECIMALS = 3;

// Nullable non-metric columns added after the initial schema; added via ALTER TABLE when missing.
export const ACTIVITY_EXTRA_COLUMNS = {
	filename: 'TEXT', // file in the export's activities/ folder, e.g. "12345.fit.gz"
	...ACTIVITY_API_COLUMNS,
	...ACTIVITY_LOCATION_COLUMNS,
} as const satisfies Record<string, ColumnType>;

const columnsSql = (columns: Record<string, ColumnType>) =>
	Object.entries(columns)
		.map(([name, type]) => `\t${name.padEnd(28)} ${type},`)
		.join('\n');

export const CREATE_ACTIVITIES_TABLE = `
CREATE TABLE IF NOT EXISTS activities (
	id                   INTEGER PRIMARY KEY,
	name                 TEXT    NOT NULL,
	sport_type           TEXT    NOT NULL,
	start_date           TEXT    NOT NULL,
	description          TEXT,
	distance             REAL,
	moving_time          INTEGER,
	elapsed_time         INTEGER,
	total_elevation_gain REAL,
	average_speed        REAL,
	max_speed            REAL,
	average_heartrate    REAL,
	max_heartrate        REAL,
	average_watts        REAL,
	calories             REAL,
	gear_name            TEXT,
	filename             TEXT,
${columnsSql(ACTIVITY_API_COLUMNS)}
${columnsSql(ACTIVITY_LOCATION_COLUMNS)}
${columnsSql(ACTIVITY_METRIC_COLUMNS)}
	commute              INTEGER NOT NULL DEFAULT 0 CHECK (commute IN (0, 1)),
	source               TEXT    NOT NULL DEFAULT 'export' CHECK (source IN ('export', 'api')),
	imported_at          TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_activities_start_date ON activities (start_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_sport_type ON activities (sport_type);
`;
