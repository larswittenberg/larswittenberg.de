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

export type YearlyKilometers = { year: string; kilometers: number; activities: number };

/** Protected: yearly distance in full km and activity count per group of sport types; years without activities in between are filled with 0. */
export async function getYearlyKilometers<K extends string>(
	groups: Record<K, readonly string[]>,
): Promise<Record<K, YearlyKilometers[]>> {
	if (!(await isAuthenticated())) throw new Error('Unauthorized');
	const sportTypes = [...new Set(Object.values<readonly string[]>(groups).flat())];
	const db = openDb();
	try {
		const rows = db
			.prepare(
				`SELECT sport_type AS sportType, strftime('%Y', start_date) AS year, COALESCE(SUM(distance), 0) AS meters, COUNT(*) AS count
				FROM activities
				WHERE sport_type IN (${sportTypes.map(() => '?').join(', ')})
				GROUP BY sport_type, year
				ORDER BY year`,
			)
			.all(...sportTypes) as { sportType: string; year: string; meters: number; count: number }[];

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
		return db
			.prepare(
				`SELECT sport_type AS sportType,
					COUNT(*) AS count,
					COALESCE(SUM(distance), 0) AS distance,
					COALESCE(SUM(total_elevation_gain), 0) AS elevation,
					COALESCE(SUM(moving_time), 0) AS movingTime
				FROM activities
				GROUP BY sport_type
				ORDER BY count DESC, sport_type`,
			)
			.all() as SportTypeTotals[];
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

		const select = `SELECT ${LIST_COLUMNS.join(', ')} FROM activities`;
		const activities = (
			selectedYear === ALL_YEARS
				? db.prepare(`${select} ORDER BY start_date DESC`).all()
				: db
						.prepare(`${select} WHERE start_date >= ? AND start_date < ? ORDER BY start_date DESC`)
						.all(`${selectedYear}-01-01`, `${Number(selectedYear) + 1}-01-01`)
		) as StravaActivityListItem[];

		return { activities, years, selectedYear, defaultYear };
	} finally {
		db.close();
	}
}
