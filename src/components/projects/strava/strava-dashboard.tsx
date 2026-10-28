'use client';

import { useId, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Select } from '@/components/projects/github-stars/ui/select';
import { Label } from '@/components/projects/github-stars/ui/label';
import type { StravaActivityListItem } from '@/lib/strava/db';

type SortOption = 'date-desc' | 'date-asc' | 'distance-desc' | 'elevation-desc' | 'duration-desc';

const SORT_OPTIONS: Record<SortOption, string> = {
	'date-desc': 'Neueste zuerst',
	'date-asc': 'Älteste zuerst',
	'distance-desc': 'Längste Distanz',
	'elevation-desc': 'Meiste Höhenmeter',
	'duration-desc': 'Längste Dauer',
};

const ALL = 'all';

const numberFormat = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const integerFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat('de-DE', {
	day: '2-digit',
	month: '2-digit',
	year: 'numeric',
	timeZone: 'Europe/Berlin',
});

function formatDistance(meters: number | null) {
	return meters ? `${numberFormat.format(meters / 1000)} km` : '–';
}

function formatElevation(meters: number | null) {
	return meters ? `${integerFormat.format(meters)} hm` : '–';
}

function formatDuration(seconds: number | null) {
	if (!seconds) return '–';
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = String(seconds % 60).padStart(2, '0');
	return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

const yearOf = (activity: StravaActivityListItem) => activity.start_date.slice(0, 4);

const sorters: Record<SortOption, (a: StravaActivityListItem, b: StravaActivityListItem) => number> = {
	'date-desc': (a, b) => b.start_date.localeCompare(a.start_date),
	'date-asc': (a, b) => a.start_date.localeCompare(b.start_date),
	'distance-desc': (a, b) => (b.distance ?? 0) - (a.distance ?? 0),
	'elevation-desc': (a, b) => (b.total_elevation_gain ?? 0) - (a.total_elevation_gain ?? 0),
	'duration-desc': (a, b) => (b.moving_time ?? 0) - (a.moving_time ?? 0),
};

export function StravaDashboard({ activities }: { activities: StravaActivityListItem[] }) {
	const [year, setYear] = useState(ALL);
	const [type, setType] = useState(ALL);
	const [sort, setSort] = useState<SortOption>('date-desc');

	const yearId = useId();
	const typeId = useId();
	const sortId = useId();

	const years = useMemo(() => [...new Set(activities.map(yearOf))].sort().reverse(), [activities]);
	const types = useMemo(() => [...new Set(activities.map((a) => a.sport_type))].sort(), [activities]);

	const filtered = useMemo(
		() =>
			activities
				.filter((a) => (year === ALL || yearOf(a) === year) && (type === ALL || a.sport_type === type))
				.sort(sorters[sort]),
		[activities, year, type, sort],
	);

	const totals = useMemo(
		() =>
			filtered.reduce(
				(sum, a) => ({
					distance: sum.distance + (a.distance ?? 0),
					elevation: sum.elevation + (a.total_elevation_gain ?? 0),
					time: sum.time + (a.moving_time ?? 0),
				}),
				{ distance: 0, elevation: 0, time: 0 },
			),
		[filtered],
	);

	const stats = [
		{ label: 'Aktivitäten', value: integerFormat.format(filtered.length) },
		{ label: 'Distanz', value: `${integerFormat.format(totals.distance / 1000)} km` },
		{ label: 'Höhenmeter', value: `${integerFormat.format(totals.elevation)} hm` },
		{ label: 'Bewegungszeit', value: `${integerFormat.format(totals.time / 3600)} h` },
	];

	return (
		<div className="space-y-8">
			<div className="flex flex-wrap items-end gap-4">
				<div className="flex flex-col gap-1">
					<Label htmlFor={yearId}>Jahr</Label>
					<Select id={yearId} value={year} onChange={(e) => setYear(e.target.value)} className="w-40">
						<option value={ALL}>Alle Jahre</option>
						{years.map((y) => (
							<option key={y} value={y}>
								{y}
							</option>
						))}
					</Select>
				</div>
				<div className="flex flex-col gap-1">
					<Label htmlFor={typeId}>Typ</Label>
					<Select id={typeId} value={type} onChange={(e) => setType(e.target.value)} className="w-48">
						<option value={ALL}>Alle Typen</option>
						{types.map((t) => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</Select>
				</div>
				<div className="flex flex-col gap-1">
					<Label htmlFor={sortId}>Sortierung</Label>
					<Select
						id={sortId}
						value={sort}
						onChange={(e) => setSort(e.target.value as SortOption)}
						className="w-52"
					>
						{(Object.keys(SORT_OPTIONS) as SortOption[]).map((value) => (
							<option key={value} value={value}>
								{SORT_OPTIONS[value]}
							</option>
						))}
					</Select>
				</div>
			</div>

			<dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
				{stats.map((stat) => (
					<div key={stat.label} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
						<dt className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</dt>
						<dd className="mt-1 text-2xl font-semibold">{stat.value}</dd>
					</div>
				))}
			</dl>

			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm">
					<thead className="border-b border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400">
						<tr>
							<th className="py-2 pr-4 font-medium">Datum</th>
							<th className="py-2 pr-4 font-medium">Typ</th>
							<th className="py-2 pr-4 font-medium">Name</th>
							<th className="py-2 pr-4 text-right font-medium">Distanz</th>
							<th className="py-2 pr-4 text-right font-medium">Höhe</th>
							<th className="py-2 pr-4 text-right font-medium">Dauer</th>
							<th className="py-2 font-medium">
								<span className="sr-only">Strava</span>
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100 dark:divide-gray-800">
						{filtered.map((a) => (
							<tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
								<td className="py-2 pr-4 whitespace-nowrap tabular-nums">
									{dateFormat.format(new Date(a.start_date))}
								</td>
								<td className="py-2 pr-4 whitespace-nowrap">{a.sport_type}</td>
								<td className="py-2 pr-4">{a.name}</td>
								<td className="py-2 pr-4 text-right whitespace-nowrap tabular-nums">
									{formatDistance(a.distance)}
								</td>
								<td className="py-2 pr-4 text-right whitespace-nowrap tabular-nums">
									{formatElevation(a.total_elevation_gain)}
								</td>
								<td className="py-2 pr-4 text-right whitespace-nowrap tabular-nums">
									{formatDuration(a.moving_time)}
								</td>
								<td className="py-2 whitespace-nowrap">
									<a
										href={`https://www.strava.com/activities/${a.id}`}
										target="_blank"
										rel="noreferrer"
										className="inline-flex items-center gap-1 text-orange-600 hover:underline dark:text-orange-400"
										aria-label={`${a.name} auf Strava öffnen`}
									>
										Strava
										<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
									</a>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{filtered.length === 0 && (
					<p className="py-8 text-center text-gray-600 dark:text-gray-400">Keine Aktivitäten gefunden.</p>
				)}
			</div>
		</div>
	);
}
