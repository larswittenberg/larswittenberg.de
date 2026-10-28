'use client';

import { Fragment, useId, useMemo, useState, useSyncExternalStore } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
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
const DEFAULT_SORT: SortOption = 'date-desc';

const isSortOption = (value: string): value is SortOption => Object.hasOwn(SORT_OPTIONS, value);

type Filters = { year: string; type: string; sort: SortOption };

const URL_CHANGE_EVENT = 'strava-filters-change';

function subscribeToUrl(callback: () => void) {
	window.addEventListener('popstate', callback);
	window.addEventListener(URL_CHANGE_EVENT, callback);
	return () => {
		window.removeEventListener('popstate', callback);
		window.removeEventListener(URL_CHANGE_EVENT, callback);
	};
}

function writeFiltersToUrl(filters: Filters) {
	const params = new URLSearchParams(window.location.search);
	const set = (key: string, value: string, fallback: string) =>
		value === fallback ? params.delete(key) : params.set(key, value);
	set('year', filters.year, ALL);
	set('type', filters.type, ALL);
	set('sort', filters.sort, DEFAULT_SORT);
	const query = params.toString();
	window.history.replaceState(window.history.state, '', query ? `?${query}` : window.location.pathname);
	window.dispatchEvent(new Event(URL_CHANGE_EVENT));
}

const numberFormat = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const integerFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat('de-DE', {
	day: '2-digit',
	month: '2-digit',
	year: 'numeric',
	timeZone: 'Europe/Berlin',
});
const timeFormat = new Intl.DateTimeFormat('de-DE', {
	hour: '2-digit',
	minute: '2-digit',
	timeZone: 'Europe/Berlin',
});
const decimalFormat = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

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

function formatSpeed(metersPerSecond: number | null) {
	return metersPerSecond ? `${decimalFormat.format(metersPerSecond * 3.6)} km/h` : null;
}

function getDetails(a: StravaActivityListItem) {
	// Older export rows lack average_speed; derive it like Strava does.
	const avgSpeed = a.average_speed ?? (a.distance && a.moving_time ? a.distance / a.moving_time : null);

	return [
		{ label: 'Startzeit', value: `${timeFormat.format(new Date(a.start_date))} Uhr` },
		{ label: 'Gesamtzeit', value: a.elapsed_time ? formatDuration(a.elapsed_time) : null },
		{ label: 'Ø Geschwindigkeit', value: formatSpeed(avgSpeed) },
		{ label: 'Max. Geschwindigkeit', value: formatSpeed(a.max_speed) },
		{ label: 'Ø Leistung', value: a.average_watts ? `${integerFormat.format(a.average_watts)} W` : null },
		{ label: 'Kalorien', value: a.calories ? `${integerFormat.format(a.calories)} kcal` : null },
		{
			label: 'Ø Herzfrequenz',
			value: a.average_heartrate ? `${integerFormat.format(a.average_heartrate)} bpm` : null,
		},
		{ label: 'Max. Herzfrequenz', value: a.max_heartrate ? `${integerFormat.format(a.max_heartrate)} bpm` : null },
		{ label: 'Ausrüstung', value: a.gear_name },
	].filter((d): d is { label: string; value: string } => Boolean(d.value));
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
	const [expanded, setExpanded] = useState<Set<number>>(() => new Set());

	const toggle = (id: number) =>
		setExpanded((prev) => {
			const next = new Set(prev);
			if (!next.delete(id)) next.add(id);
			return next;
		});

	const yearId = useId();
	const typeId = useId();
	const sortId = useId();

	const years = useMemo(() => [...new Set(activities.map(yearOf))].sort().reverse(), [activities]);
	const types = useMemo(() => [...new Set(activities.map((a) => a.sport_type))].sort(), [activities]);

	// Server snapshot is empty so the page stays statically rendered with default filters.
	const search = useSyncExternalStore(
		subscribeToUrl,
		() => window.location.search,
		() => '',
	);

	const { year, type, sort } = useMemo<Filters>(() => {
		const params = new URLSearchParams(search);
		const urlYear = params.get('year') ?? '';
		const urlType = params.get('type') ?? '';
		const urlSort = params.get('sort') ?? '';
		return {
			year: years.includes(urlYear) ? urlYear : ALL,
			type: types.includes(urlType) ? urlType : ALL,
			sort: isSortOption(urlSort) ? urlSort : DEFAULT_SORT,
		};
	}, [search, years, types]);

	const updateFilters = (next: Partial<Filters>) => writeFiltersToUrl({ year, type, sort, ...next });

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
					<Select
						id={yearId}
						value={year}
						onChange={(e) => updateFilters({ year: e.target.value })}
						className="w-40"
					>
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
					<Select
						id={typeId}
						value={type}
						onChange={(e) => updateFilters({ type: e.target.value })}
						className="w-48"
					>
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
						onChange={(e) => updateFilters({ sort: e.target.value as SortOption })}
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
							<th className="w-8 py-2">
								<span className="sr-only">Details</span>
							</th>
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
						{filtered.map((a) => {
							const isOpen = expanded.has(a.id);
							const detailsId = `strava-details-${a.id}`;
							return (
								<Fragment key={a.id}>
									<tr
										onClick={() => toggle(a.id)}
										className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
									>
										<td className="py-2">
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													toggle(a.id);
												}}
												aria-expanded={isOpen}
												aria-controls={detailsId}
												aria-label={`Details zu ${a.name} ${isOpen ? 'zuklappen' : 'aufklappen'}`}
												className="flex h-6 w-6 items-center justify-center rounded text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
											>
												<ChevronDown
													className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
													aria-hidden="true"
												/>
											</button>
										</td>
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
												onClick={(e) => e.stopPropagation()}
												className="inline-flex items-center gap-1 text-orange-600 hover:underline dark:text-orange-400"
												aria-label={`${a.name} auf Strava öffnen`}
											>
												Strava
												<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
											</a>
										</td>
									</tr>
									{isOpen && (
										<tr id={detailsId} className="bg-gray-50 dark:bg-gray-900">
											<td />
											<td colSpan={7} className="py-4 pr-4">
												<dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
													{getDetails(a).map((d) => (
														<div key={d.label}>
															<dt className="text-xs text-gray-600 dark:text-gray-400">
																{d.label}
															</dt>
															<dd className="font-medium tabular-nums">{d.value}</dd>
														</div>
													))}
												</dl>
												{a.description && (
													<p className="mt-4 max-w-prose whitespace-pre-line text-gray-700 dark:text-gray-300">
														{a.description}
													</p>
												)}
											</td>
										</tr>
									)}
								</Fragment>
							);
						})}
					</tbody>
				</table>
				{filtered.length === 0 && (
					<p className="py-8 text-center text-gray-600 dark:text-gray-400">Keine Aktivitäten gefunden.</p>
				)}
			</div>
		</div>
	);
}
