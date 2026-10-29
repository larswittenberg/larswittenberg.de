import type { Metadata } from 'next';
import LayoutDefault from '@/components/LayoutDefault';
import { StravaDashboard } from '@/components/projects/strava/strava-dashboard';
import { StravaLoginForm } from '@/components/projects/strava/strava-login-form';
import { StravaTotalsOverview } from '@/components/projects/strava/strava-totals-overview';
import { getActivityTotals, getDashboardData } from '@/lib/strava/db';
import { isAuthenticated } from '@/lib/strava/session';
import { logout } from './actions';

export const metadata: Metadata = {
	title: 'Strava Dashboard',
	robots: { index: false, follow: false },
};

type PageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
	const totals = getActivityTotals();
	const { year } = await searchParams;
	const data = (await isAuthenticated()) ? await getDashboardData(typeof year === 'string' ? year : undefined) : null;

	return (
		<LayoutDefault prose wide>
			<h1>Strava Dashboard</h1>

			<div className="not-prose space-y-10">
				<StravaTotalsOverview totals={totals} />

				{data ? (
					<>
						<form action={logout} className="flex justify-end">
							<button
								type="submit"
								className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
							>
								Abmelden
							</button>
						</form>
						<StravaDashboard {...data} />
					</>
				) : (
					<StravaLoginForm />
				)}
			</div>
		</LayoutDefault>
	);
}
