import { ACTIVITY_METRIC_COLUMNS, type ActivityMetricColumn } from '../../../src/lib/strava/schema';
import { API_SPORT_TYPES } from '../../../src/lib/strava/sport-types';
import type { StravaActivity, StravaActivityApiFields, StravaActivityMetrics } from '../../../src/types/strava';
import type { DetailedActivity } from './types';

// Units match the export (m, s, m/s), see ACTIVITY_METRIC_COLUMNS in src/lib/strava/schema.ts.

export type ApiActivityRecord = StravaActivity & StravaActivityApiFields;

/** Subtypes fall back to the legacy `type` (e.g. GravelRide -> Ride) like the export; the raw value is kept in api_sport_type. */
export function mapSportType(sportType: string, legacyType?: string): { sportType: string; known: boolean } {
	const mapped = API_SPORT_TYPES[sportType] ?? (legacyType ? API_SPORT_TYPES[legacyType] : undefined);
	return mapped ? { sportType: mapped, known: true } : { sportType, known: false };
}

// Export-only columns; stay NULL for API rows until the next export import.
export const API_UNAVAILABLE_COLUMNS = [
	'weather_condition',
	'weather_temperature',
	'apparent_temperature',
	'humidity',
	'wind_speed',
	'wind_gust',
	'wind_bearing',
	'cloud_cover',
	'precipitation_intensity',
	'precipitation_probability',
	'weather_pressure',
	'uv_index',
	'elevation_loss',
	'max_grade',
	'average_grade',
	'max_cadence',
	'training_load',
	'intensity',
	'perceived_exertion',
	'grade_adjusted_distance',
	'average_grade_adjusted_speed',
	'total_steps',
	'dirt_distance',
	'athlete_weight',
	'bike_weight',
	'filename',
] as const;

const API_METRICS: Partial<Record<ActivityMetricColumn, (a: DetailedActivity) => number | null | undefined>> = {
	elev_low: (a) => a.elev_low,
	elev_high: (a) => a.elev_high,
	average_cadence: (a) => a.average_cadence,
	weighted_average_watts: (a) => a.weighted_average_watts,
	kilojoules: (a) => a.kilojoules,
	relative_effort: (a) => a.suffer_score,
	average_temp: (a) => a.average_temp,
};

function toMetrics(a: DetailedActivity): StravaActivityMetrics {
	const metrics = {} as StravaActivityMetrics;
	for (const key of Object.keys(ACTIVITY_METRIC_COLUMNS) as ActivityMetricColumn[]) {
		const value = API_METRICS[key]?.(a) ?? null;
		metrics[key] = value !== null && ACTIVITY_METRIC_COLUMNS[key] === 'INTEGER' ? Math.round(value) : value;
	}
	return metrics;
}

const text = (value: string | null | undefined) => value?.trim() || null;

/** syncedAt: null for summary-only data, so strava:enrich fetches the details later. */
export function toApiFields(a: DetailedActivity, syncedAt: string | null): StravaActivityApiFields {
	return {
		api_sport_type: a.sport_type ?? null,
		device_name: text(a.device_name),
		workout_type: a.workout_type ?? null,
		trainer: a.trainer ?? null,
		visibility: a.visibility ?? null,
		external_id: text(a.external_id),
		gear_id: a.gear_id ?? null,
		start_date_local: a.start_date_local ?? null,
		timezone: a.timezone ?? null,
		api_synced_at: syncedAt,
		api_status: syncedAt ? 'ok' : null,
	};
}

export function toActivityRecord(
	a: DetailedActivity,
	options: { gearName: string | null; syncedAt: string | null; onUnknownSportType?: (raw: string) => void },
): ApiActivityRecord {
	const { sportType, known } = mapSportType(a.sport_type, a.type);
	if (!known) options.onUnknownSportType?.(sportType);

	return {
		id: a.id,
		name: a.name,
		sport_type: sportType,
		start_date: a.start_date,
		description: text(a.description),
		distance: a.distance ?? null,
		moving_time: a.moving_time ?? null,
		elapsed_time: a.elapsed_time ?? null,
		total_elevation_gain: a.total_elevation_gain ?? null,
		average_speed: a.average_speed ?? null,
		max_speed: a.max_speed ?? null,
		average_heartrate: a.average_heartrate ?? null,
		max_heartrate: a.max_heartrate ?? null,
		average_watts: a.average_watts ?? null,
		calories: a.calories ?? null,
		gear_name: a.gear?.name ?? options.gearName,
		filename: null,
		...toMetrics(a),
		commute: a.commute ?? false,
		source: 'api',
		...toApiFields(a, options.syncedAt),
	};
}
