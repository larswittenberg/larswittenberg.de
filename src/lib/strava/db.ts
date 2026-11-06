import Database from 'better-sqlite3';
import { ACTIVITY_METRIC_COLUMNS, STRAVA_DB_FILE } from '@/lib/strava/schema';
import { isAuthenticated } from '@/lib/strava/session';
import { TOTALS_SUBTYPES, formatApiSportType } from '@/lib/strava/sport-types';
import type { StravaActivity, StravaActivityApiFields } from '@/types/strava';

export type StravaActivityListItem = Omit<StravaActivity, 'source'> &
	Pick<StravaActivityApiFields, 'api_sport_type' | 'device_name' | 'workout_type'> & { trainer: boolean };

type StravaActivityListRow = Omit<StravaActivityListItem, 'commute' | 'trainer'> & {
	commute: 0 | 1;
	trainer: 0 | 1 | null;
};

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
	'filename',
	'api_sport_type',
	'device_name',
	'workout_type',
	'trainer',
	'commute',
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

/**
 * SQL expression for the sport type used in totals and charts: subtypes in TOTALS_SUBTYPES (e.g. GravelRide)
 * get their own group instead of counting towards their parent. Map results with `toTotalsSportType`.
 */
const TOTALS_SUBTYPE_KEYS = Object.keys(TOTALS_SUBTYPES);
const TOTALS_SPORT_TYPE_SQL = `CASE WHEN api_sport_type IN (${TOTALS_SUBTYPE_KEYS.map(() => '?').join(', ') || 'NULL'}) THEN api_sport_type ELSE sport_type END`;
const toTotalsSportType = (sportType: string) =>
	Object.hasOwn(TOTALS_SUBTYPES, sportType) ? formatApiSportType(sportType) : sportType;

export type YearlyKilometers = { year: string; kilometers: number; activities: number };

/** Protected: yearly distance in full km and activity count per group of sport types; years without activities in between are filled with 0. */
export async function getYearlyKilometers<K extends string>(
	groups: Record<K, readonly string[]>,
): Promise<Record<K, YearlyKilometers[]>> {
	if (!(await isAuthenticated())) throw new Error('Unauthorized');
	const sportTypes = [...new Set(Object.values<readonly string[]>(groups).flat())];
	const db = openDb();
	try {
		const rows = (
			db
				.prepare(
					`SELECT ${TOTALS_SPORT_TYPE_SQL} AS sportType, strftime('%Y', start_date) AS year, COALESCE(SUM(distance), 0) AS meters, COUNT(*) AS count
				FROM activities
				GROUP BY 1, year
				ORDER BY year`,
				)
				.all(...TOTALS_SUBTYPE_KEYS) as { sportType: string; year: string; meters: number; count: number }[]
		)
			.map((r) => ({ ...r, sportType: toTotalsSportType(r.sportType) }))
			.filter((r) => sportTypes.includes(r.sportType));

		const result = {} as Record<K, YearlyKilometers[]>;
		for (const key of Object.keys(groups) as K[]) {
			const groupTypes = new Set(groups[key]);
			const metersByYear = new Map<string, number>();
			const countByYear = new Map<string, number>();
			for (const r of rows) {
				if (!groupTypes.has(r.sportType)) continue;
				metersByYear.set(r.year, (metersByYear.get(r.year) ?? 0) + r.meters);
				countByYear.set(r.year, (countByYear.get(r.year) ?? 0) + r.count);
			}
			if (metersByYear.size === 0) {
				result[key] = [];
				continue;
			}
			const years = [...metersByYear.keys()].map(Number);
			const first = Math.min(...years);
			const last = Math.max(...years);
			result[key] = Array.from({ length: last - first + 1 }, (_, i) => {
				const year = String(first + i);
				return {
					year,
					kilometers: Math.round((metersByYear.get(year) ?? 0) / 1000),
					activities: countByYear.get(year) ?? 0,
				};
			});
		}
		return result;
	} finally {
		db.close();
	}
}

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

export type SportTypeTotals = Omit<StravaTotals, 'firstYear'> & { sportType: string };

/** Protected: totals per sport type over all years, most activities first. */
export async function getSportTypeTotals(): Promise<SportTypeTotals[]> {
	if (!(await isAuthenticated())) throw new Error('Unauthorized');
	const db = openDb();
	try {
		const rows = db
			.prepare(
				`SELECT ${TOTALS_SPORT_TYPE_SQL} AS sportType,
					COUNT(*) AS count,
					COALESCE(SUM(distance), 0) AS distance,
					COALESCE(SUM(total_elevation_gain), 0) AS elevation,
					COALESCE(SUM(moving_time), 0) AS movingTime
				FROM activities
				GROUP BY 1
				ORDER BY count DESC, 1`,
			)
			.all(...TOTALS_SUBTYPE_KEYS) as SportTypeTotals[];
		return rows.map((r) => ({ ...r, sportType: toTotalsSportType(r.sportType) }));
	} finally {
		db.close();
	}
}

export const ALL_YEARS = 'all';

export type StravaDashboardData = {
	activities: StravaActivityListItem[];
	years: string[];
	selectedYear: string;
	defaultYear: string;
};

/** Protected: throws without a valid session. Loads only the requested year (default: current year). */
export async function getDashboardData(requestedYear: string | undefined): Promise<StravaDashboardData> {
	if (!(await isAuthenticated())) throw new Error('Unauthorized');
	const db = openDb();
	try {
		const years = (
			db
				.prepare('SELECT DISTINCT strftime(?, start_date) AS year FROM activities ORDER BY year DESC')
				.all('%Y') as { year: string }[]
		).map((r) => r.year);

		const currentYear = String(new Date().getUTCFullYear());
		const defaultYear = years.includes(currentYear) ? currentYear : (years[0] ?? ALL_YEARS);
		const selectedYear =
			requestedYear === ALL_YEARS || (requestedYear && years.includes(requestedYear))
				? requestedYear
				: defaultYear;

		// Columns added by the API scripts may be missing until the DB has been migrated.
		const existing = new Set(
			(db.prepare('PRAGMA table_info(activities)').all() as { name: string }[]).map((c) => c.name),
		);
		const select = `SELECT ${LIST_COLUMNS.map((c) => (existing.has(c) ? c : `NULL AS ${c}`)).join(', ')} FROM activities`;
		const rows = (
			selectedYear === ALL_YEARS
				? db.prepare(`${select} ORDER BY start_date DESC`).all()
				: db
						.prepare(`${select} WHERE start_date >= ? AND start_date < ? ORDER BY start_date DESC`)
						.all(`${selectedYear}-01-01`, `${Number(selectedYear) + 1}-01-01`)
		) as StravaActivityListRow[];
		const activities = rows.map((r) => ({ ...r, commute: r.commute === 1, trainer: r.trainer === 1 }));

		return { activities, years, selectedYear, defaultYear };
	} finally {
		db.close();
	}
}
