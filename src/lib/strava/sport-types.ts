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
