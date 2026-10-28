import type { Metadata } from 'next';
import LayoutDefault from '@/components/LayoutDefault';
import { StravaDashboard } from '@/components/projects/strava/strava-dashboard';
import { getActivities } from '@/lib/strava/db';

export const metadata: Metadata = {
	title: 'Strava Dashboard',
	robots: { index: false, follow: false },
};

export default function Page() {
	const activities = getActivities();

	return (
		<LayoutDefault prose fullWidth>
			<h1>Strava Dashboard</h1>

			<div className="not-prose">
				<StravaDashboard activities={activities} />
			</div>
		</LayoutDefault>
	);
}
