export const STRAVA_DB_FILE = 'src/data/strava.db';

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
	commute              INTEGER NOT NULL DEFAULT 0 CHECK (commute IN (0, 1)),
	source               TEXT    NOT NULL DEFAULT 'export' CHECK (source IN ('export', 'api')),
	imported_at          TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_activities_start_date ON activities (start_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_sport_type ON activities (sport_type);
`;
