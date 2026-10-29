import type { Metadata } from 'next';
import LayoutDefault from '@/components/LayoutDefault';
import { StravaDashboard } from '@/components/projects/strava/strava-dashboard';
import { StravaLoginForm } from '@/components/projects/strava/strava-login-form';
import { StravaTotalsOverview } from '@/components/projects/strava/strava-totals-overview';
import { getActivities, getActivityTotals } from '@/lib/strava/db';
import { isAuthenticated } from '@/lib/strava/session';
import { logout } from './actions';

export const metadata: Metadata = {
	title: 'Strava Dashboard',
	robots: { index: false, follow: false },
};

export default async function Page() {
	const totals = getActivityTotals();
	const activities = (await isAuthenticated()) ? await getActivities() : null;

	return (
		<LayoutDefault prose wide>
			<h1>Strava Dashboard</h1>

			<div className="not-prose space-y-10">
				<StravaTotalsOverview totals={totals} />

				{activities ? (
					<>
						<form action={logout} className="flex justify-end">
							<button type="submit" className="text-sm text-gray-600 hover:underline dark:text-gray-400">
								Abmelden
							</button>
						</form>
						<StravaDashboard activities={activities} />
					</>
				) : (
					<StravaLoginForm />
				)}
			</div>
		</LayoutDefault>
	);
}
