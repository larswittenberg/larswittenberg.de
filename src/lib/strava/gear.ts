// Fixed display order for the dashboard gear filter; gear not listed here follows alphabetically.
export const GEAR_ORDER = [
	'Canyon Ultimate',
	'Canyon Grizl',
	'Zwift Ride',
	'Cube Crosser',
	'Rose Reveal Four',
	'Geliehenes E-Bike',
	'Peugeot Rennrad',
	'RegioRad',
	'Klapprad',
	'Adidas ROT',
];

export function compareGear(a: string, b: string) {
	const ia = GEAR_ORDER.indexOf(a);
	const ib = GEAR_ORDER.indexOf(b);
	if (ia !== -1 || ib !== -1) return ia === -1 ? 1 : ib === -1 ? -1 : ia - ib;
	return a.localeCompare(b, 'de-DE');
}
