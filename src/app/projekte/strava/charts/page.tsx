import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import LayoutDefault from '@/components/LayoutDefault';
import { YearlyKilometersChart } from '@/components/projects/strava/yearly-kilometers-chart';
import { getYearlyKilometers } from '@/lib/strava/db';
import { isAuthenticated } from '@/lib/strava/session';
import { CYCLING_SPORT_TYPES } from '@/lib/strava/sport-types';

export const metadata: Metadata = {
	title: 'Strava Dashboard - Charts',
	robots: { index: false, follow: false },
};

const CHART_GROUPS = {
	cycling: CYCLING_SPORT_TYPES,
	run: ['Run'],
	ride: ['Ride'],
	ebike: ['E-Bike Ride'],
	virtual: ['Virtual Ride'],
} as const satisfies Record<string, readonly string[]>;

type ChartKey = keyof typeof CHART_GROUPS;

const CYCLING_CHART: { key: ChartKey; title: string } = { key: 'cycling', title: 'Radfahren gesamt' };

const CHARTS: { key: ChartKey; title: string }[] = [
	{ key: 'ride', title: 'Radfahren' },
	{ key: 'ebike', title: 'E-Bike' },
	{ key: 'virtual', title: 'Virtuelles Radfahren' },
	{ key: 'run', title: 'Laufen' },
];

export default async function Page() {
	if (!(await isAuthenticated())) redirect('/projekte/strava');
	const kilometers = await getYearlyKilometers(CHART_GROUPS);

	return (
		<LayoutDefault prose wide>
			<h1>Strava Dashboard - Charts</h1>

			<div className="not-prose space-y-8">
				<Link
					href="/projekte/strava"
					className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:underline dark:text-gray-300"
				>
					<ArrowLeft className="size-4" aria-hidden="true" />
					Zurück zum Dashboard
				</Link>

				<YearlyKilometersChart
					title={CYCLING_CHART.title}
					sportTypes={CHART_GROUPS[CYCLING_CHART.key]}
					data={kilometers[CYCLING_CHART.key]}
				/>

				<div className="grid gap-8 xl:grid-cols-2">
					{CHARTS.map(({ key, title }) => (
						<YearlyKilometersChart
							key={key}
							title={title}
							sportTypes={CHART_GROUPS[key]}
							data={kilometers[key]}
						/>
					))}
				</div>
			</div>
		</LayoutDefault>
	);
}
