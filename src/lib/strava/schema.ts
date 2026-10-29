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

const metricColumnsSql = Object.entries(ACTIVITY_METRIC_COLUMNS)
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
${metricColumnsSql}
	commute              INTEGER NOT NULL DEFAULT 0 CHECK (commute IN (0, 1)),
	source               TEXT    NOT NULL DEFAULT 'export' CHECK (source IN ('export', 'api')),
	imported_at          TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_activities_start_date ON activities (start_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_sport_type ON activities (sport_type);
`;
