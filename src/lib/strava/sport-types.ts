// Strava sport types combined into the "Radfahren" group (dashboard filter and charts).
export const CYCLING_SPORT_TYPES = ['Ride', 'E-Bike Ride', 'Virtual Ride'] as const;

// Main sport types shown in the per-sport totals, in display order.
export const MAIN_SPORT_TYPES = ['Ride', 'Virtual Ride', 'E-Bike Ride', 'Run', 'Hike', 'Walk'];

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

/** "GravelRide" -> "Gravel Ride" */
export const formatApiSportType = (apiSportType: string) => apiSportType.replace(/([a-z])([A-Z])/g, '$1 $2');
