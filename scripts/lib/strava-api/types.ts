// Subset of the Strava API v3 models; only fields used by the scripts.

export type TokenResponse = {
	token_type: string;
	access_token: string;
	refresh_token: string;
	/** epoch seconds */
	expires_at: number;
	expires_in: number;
	athlete?: { id: number };
};

export type StoredTokens = {
	access_token: string | null;
	refresh_token: string;
	/** epoch seconds */
	expires_at: number;
	athlete_id: number | null;
	scope: string | null;
};

export type SummaryGear = { id: string; name: string };

export type SummaryActivity = {
	id: number;
	name: string;
	/** deprecated legacy type, e.g. "Ride" for a GravelRide */
	type: string;
	sport_type: string;
	start_date: string;
	start_date_local?: string;
	timezone?: string;
	distance?: number;
	moving_time?: number;
	elapsed_time?: number;
	total_elevation_gain?: number;
	elev_high?: number;
	elev_low?: number;
	average_speed?: number;
	max_speed?: number;
	average_heartrate?: number;
	max_heartrate?: number;
	average_watts?: number;
	weighted_average_watts?: number;
	kilojoules?: number;
	average_cadence?: number;
	average_temp?: number;
	suffer_score?: number | null;
	workout_type?: number | null;
	trainer?: boolean;
	commute?: boolean;
	visibility?: string;
	external_id?: string | null;
	gear_id?: string | null;
};

export type DetailedActivity = SummaryActivity & {
	description?: string | null;
	calories?: number;
	device_name?: string | null;
	gear?: SummaryGear | null;
};

export type DetailedAthlete = {
	id: number;
	/** only with scope profile:read_all */
	bikes?: SummaryGear[];
	shoes?: SummaryGear[];
};
