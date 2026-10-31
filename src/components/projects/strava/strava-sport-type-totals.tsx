import type { SportTypeTotals } from '@/lib/strava/db';
import { CYCLING_SPORT_TYPES, MAIN_SPORT_TYPES } from '@/lib/strava/sport-types';

const numberFormat = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const integerFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });

const CYCLING_TYPES = new Set<string>(CYCLING_SPORT_TYPES);

function formatMovingTime(seconds: number) {
	const totalMinutes = Math.round(seconds / 60);
	return `${integerFormat.format(Math.floor(totalMinutes / 60))} h ${String(totalMinutes % 60).padStart(2, '0')} min`;
}

export function StravaSportTypeTotals({ totals: allTotals }: { totals: SportTypeTotals[] }) {
	const totals = MAIN_SPORT_TYPES.map((type) => allTotals.find((t) => t.sportType === type)).filter(
		(t): t is SportTypeTotals => Boolean(t),
	);
	const cyclingRows = totals.filter((t) => CYCLING_TYPES.has(t.sportType));
	// Same combined "Radfahren" group as the dashboard type filter.
	const cycling: SportTypeTotals | null =
		cyclingRows.length > 1
			? cyclingRows.reduce(
					(sum, t) => ({
						...sum,
						count: sum.count + t.count,
						distance: sum.distance + t.distance,
						elevation: sum.elevation + t.elevation,
						movingTime: sum.movingTime + t.movingTime,
					}),
					{ sportType: 'Radfahren (gesamt)', count: 0, distance: 0, elevation: 0, movingTime: 0 },
				)
			: null;
	const rows = cycling ? [cycling, ...totals] : totals;

	if (rows.length === 0) return null;

	return (
		<section aria-labelledby="strava-sport-type-totals-heading">
			<h2 id="strava-sport-type-totals-heading" className="mb-3 text-lg font-semibold">
				Summen pro Sportart (alle Jahre)
			</h2>
			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm">
					<thead className="border-b border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400">
						<tr>
							<th scope="col" className="py-2 pr-4 font-medium">
								Sportart
							</th>
							<th scope="col" className="py-2 pr-4 text-right font-medium">
								Aktivitäten
							</th>
							<th scope="col" className="py-2 pr-4 text-right font-medium">
								Distanz
							</th>
							<th scope="col" className="py-2 pr-4 text-right font-medium">
								Höhenmeter
							</th>
							<th scope="col" className="py-2 text-right font-medium">
								Bewegungszeit
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100 dark:divide-gray-800">
						{rows.map((t) => (
							<tr key={t.sportType} className={t === cycling ? 'font-semibold' : undefined}>
								<th scope="row" className="py-2 pr-4 font-[inherit]">
									{t.sportType}
								</th>
								<td className="py-2 pr-4 text-right tabular-nums">{integerFormat.format(t.count)}</td>
								<td className="py-2 pr-4 text-right whitespace-nowrap tabular-nums">
									{t.distance ? `${numberFormat.format(t.distance / 1000)} km` : '–'}
								</td>
								<td className="py-2 pr-4 text-right whitespace-nowrap tabular-nums">
									{t.elevation ? `${integerFormat.format(t.elevation)} hm` : '–'}
								</td>
								<td className="py-2 text-right whitespace-nowrap tabular-nums">
									{t.movingTime ? formatMovingTime(t.movingTime) : '–'}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}
