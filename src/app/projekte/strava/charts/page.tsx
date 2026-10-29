import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import LayoutDefault from '@/components/LayoutDefault';
import { YearlyKilometersChart } from '@/components/projects/strava/yearly-kilometers-chart';
import { getYearlyKilometersBySportType } from '@/lib/strava/db';
import { isAuthenticated } from '@/lib/strava/session';

export const metadata: Metadata = {
	title: 'Strava Dashboard - Charts',
	robots: { index: false, follow: false },
};

const CHARTS = [
	{ sportType: 'Run', title: 'Laufen' },
	{ sportType: 'Ride', title: 'Radfahren' },
	{ sportType: 'E-Bike Ride', title: 'E-Bike' },
	{ sportType: 'Virtual Ride', title: 'Virtuelles Radfahren' },
] as const;

export default async function Page() {
	if (!(await isAuthenticated())) redirect('/projekte/strava');
	const kilometersBySportType = await getYearlyKilometersBySportType(CHARTS.map((c) => c.sportType));

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

				<div className="grid gap-8 xl:grid-cols-2">
					{CHARTS.map(({ sportType, title }) => (
						<YearlyKilometersChart
							key={sportType}
							title={title}
							sportType={sportType}
							data={kilometersBySportType[sportType]}
						/>
					))}
				</div>
			</div>
		</LayoutDefault>
	);
}
