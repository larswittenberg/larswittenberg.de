// Strava sport types combined into the "Radfahren" group (dashboard filter and charts).
export const CYCLING_SPORT_TYPES = ['Ride', 'E-Bike Ride', 'Virtual Ride'] as const;

// Main sport types shown in the per-sport totals, in display order.
export const MAIN_SPORT_TYPES = ['Ride', 'Virtual Ride', 'E-Bike Ride', 'Run', 'Hike', 'Walk'];

/** "GravelRide" -> "Gravel Ride" */
export function formatApiSportType(apiSportType: string) {
	return apiSportType.replace(/([a-z])([A-Z])/g, '$1 $2');
}

// API subtypes shown as their own row/chart in the per-sport totals and charts (taken out of their parent type), mapped to that parent.
export const TOTALS_SUBTYPES: Record<string, string> = { GravelRide: 'Ride' };

// Row order of the per-sport totals: main types with the subtypes right after their parent.
export const TOTALS_SPORT_TYPES = MAIN_SPORT_TYPES.flatMap((type) => [
	type,
	...Object.entries(TOTALS_SUBTYPES)
		.filter(([, parent]) => parent === type)
		.map(([subtype]) => formatApiSportType(subtype)),
]);

/** Adds the TOTALS_SUBTYPES rows (e.g. "Gravel Ride") whose parent is in `types`, e.g. for the combined cycling group. */
export const withTotalsSubtypes = (types: readonly string[]) => [
	...types,
	...Object.entries(TOTALS_SUBTYPES)
		.filter(([, parent]) => types.includes(parent))
		.map(([subtype]) => formatApiSportType(subtype)),
];

// Display order for sport type lists (e.g. the dashboard type filter); unlisted types follow alphabetically.
export const SPORT_TYPE_ORDER = [...MAIN_SPORT_TYPES, 'Workout', 'Yoga', 'Canoe', 'Kayaking'];

export function compareSportTypes(a: string, b: string) {
	const ia = SPORT_TYPE_ORDER.indexOf(a);
	const ib = SPORT_TYPE_ORDER.indexOf(b);
	if (ia !== -1 || ib !== -1) return ia === -1 ? 1 : ib === -1 ? -1 : ia - ib;
	return a.localeCompare(b, 'de-DE');
}

// API sport_type -> export name stored in sport_type; other API types (e.g. GravelRide) are subtypes.
export const API_SPORT_TYPES: Record<string, string> = {
	Ride: 'Ride',
	EBikeRide: 'E-Bike Ride',
	VirtualRide: 'Virtual Ride',
	Run: 'Run',
	Walk: 'Walk',
	Hike: 'Hike',
	Workout: 'Workout',
	Yoga: 'Yoga',
	Canoeing: 'Canoe',
	Kayaking: 'Kayaking',
};

export const isApiSubtype = (apiSportType: string) => !Object.hasOwn(API_SPORT_TYPES, apiSportType);

/** Type shown in lists: the finer API subtype (e.g. "Gravel Ride") if known, otherwise the stored sport_type. */
export const displaySportType = (a: { sport_type: string; api_sport_type?: string | null }) =>
	a.api_sport_type && isApiSubtype(a.api_sport_type) ? formatApiSportType(a.api_sport_type) : a.sport_type;
