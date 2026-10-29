import type { StravaTotals } from '@/lib/strava/db';

const integerFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });

export function StravaTotalsOverview({ totals }: { totals: StravaTotals }) {
	const stats = [
		{ label: 'Aktivitäten', value: integerFormat.format(totals.count) },
		{ label: 'Distanz', value: `${integerFormat.format(totals.distance / 1000)} km` },
		{ label: 'Höhenmeter', value: `${integerFormat.format(totals.elevation)} hm` },
		{ label: 'Bewegungszeit', value: `${integerFormat.format(totals.movingTime / 3600)} Stunden` },
	];

	return (
		<section aria-labelledby="strava-totals-heading">
			<h2 id="strava-totals-heading" className="mb-3 text-lg font-semibold">
				Summe aller Aktivitäten{totals.firstYear ? ` seit ${totals.firstYear}` : ''}
			</h2>
			<dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
				{stats.map((stat) => (
					<div key={stat.label} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
						<dt className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</dt>
						<dd className="mt-1 text-2xl font-semibold tabular-nums">{stat.value}</dd>
					</div>
				))}
			</dl>
		</section>
	);
}
