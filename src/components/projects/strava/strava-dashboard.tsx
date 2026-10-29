'use client';

import { Fragment, useId, useMemo, useState, useSyncExternalStore, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, ChevronDown, ChevronsUpDown, ExternalLink } from 'lucide-react';
import { Select } from '@/components/projects/github-stars/ui/select';
import { Label } from '@/components/projects/github-stars/ui/label';
import type { StravaActivityListItem, StravaDashboardData } from '@/lib/strava/db';

type SortKey = 'date' | 'type' | 'name' | 'distance' | 'elevation' | 'duration';
type SortDirection = 'asc' | 'desc';
type SortOption = `${SortKey}-${SortDirection}`;

const SORT_OPTIONS: Record<SortOption, string> = {
	'date-desc': 'Neueste zuerst',
	'date-asc': 'Älteste zuerst',
	'distance-desc': 'Längste Distanz',
	'distance-asc': 'Kürzeste Distanz',
	'elevation-desc': 'Meiste Höhenmeter',
	'elevation-asc': 'Wenigste Höhenmeter',
	'duration-desc': 'Längste Dauer',
	'duration-asc': 'Kürzeste Dauer',
	'name-asc': 'Name A–Z',
	'name-desc': 'Name Z–A',
	'type-asc': 'Typ A–Z',
	'type-desc': 'Typ Z–A',
};

// Text columns start ascending, numbers and dates descending.
const DEFAULT_DIRECTION: Record<SortKey, SortDirection> = {
	date: 'desc',
	type: 'asc',
	name: 'asc',
	distance: 'desc',
	elevation: 'desc',
	duration: 'desc',
};

const SORT_VALUE: Record<SortKey, (a: StravaActivityListItem) => string | number | null> = {
	date: (a) => a.start_date,
	type: (a) => a.sport_type,
	name: (a) => a.name,
	distance: (a) => a.distance,
	elevation: (a) => a.total_elevation_gain,
	duration: (a) => a.moving_time,
};

const collator = new Intl.Collator('de-DE', { sensitivity: 'base', numeric: true });

function compareActivities(sort: SortOption) {
	const [key, direction] = sort.split('-') as [SortKey, SortDirection];
	const factor = direction === 'asc' ? 1 : -1;
	const getValue = SORT_VALUE[key];
	return (a: StravaActivityListItem, b: StravaActivityListItem) => {
		const va = getValue(a);
		const vb = getValue(b);
		// Missing values always go last, regardless of direction.
		if (va === null || vb === null) return va === vb ? 0 : va === null ? 1 : -1;
		const result =
			typeof va === 'number' && typeof vb === 'number' ? va - vb : collator.compare(String(va), String(vb));
		return result * factor;
	};
}

// Must match ALL_YEARS in src/lib/strava/db.ts (not imported to keep better-sqlite3 out of the client bundle).
const ALL = 'all';
const DEFAULT_SORT: SortOption = 'date-desc';

const isSortOption = (value: string): value is SortOption => Object.hasOwn(SORT_OPTIONS, value);

type Filters = { type: string; sort: SortOption };

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

function formatPace(metersPerSecond: number | null) {
	if (!metersPerSecond) return null;
	const secondsPerKm = Math.round(1000 / metersPerSecond);
	return `${Math.floor(secondsPerKm / 60)}:${String(secondsPerKm % 60).padStart(2, '0')} /km`;
}

function formatTemperature(celsius: number | null) {
	return celsius !== null ? `${decimalFormat.format(celsius)} °C` : null;
}

function formatPercent(fraction: number | null) {
	return fraction !== null ? `${integerFormat.format(fraction * 100)} %` : null;
}

const COMPASS = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'];
const compassDirection = (degrees: number) => COMPASS[Math.round((((degrees % 360) + 360) % 360) / 45) % 8];

const positive = (value: number | null): value is number => value !== null && value > 0;

const FOOT_SPORTS = new Set(['Run', 'Walk', 'Hike', 'Trail Run']);

type DetailItem = { label: string; value: string };
type DetailGroup = { title: string; items: { label: string; value: string | null }[] };

function getDetails(a: StravaActivityListItem) {
	// Older export rows lack average_speed; derive it like Strava does.
	const avgSpeed = a.average_speed ?? (a.distance && a.moving_time ? a.distance / a.moving_time : null);
	const isRide = a.sport_type.includes('Ride');
	const isFoot = FOOT_SPORTS.has(a.sport_type);
	// Export stores foot cadence per leg; Strava shows steps per minute.
	const cadence = (value: number | null) =>
		positive(value) ? `${integerFormat.format(isFoot ? value * 2 : value)} ${isFoot ? 'spm' : 'rpm'}` : null;

	const groups: DetailGroup[] = [
		{
			title: 'Allgemein',
			items: [
				{ label: 'Startzeit', value: `${timeFormat.format(new Date(a.start_date))} Uhr` },
				{ label: 'Gesamtzeit', value: a.elapsed_time ? formatDuration(a.elapsed_time) : null },
				{ label: 'Ausrüstung', value: a.gear_name },
				{ label: 'Kalorien', value: positive(a.calories) ? `${integerFormat.format(a.calories)} kcal` : null },
				{ label: 'Arbeit', value: positive(a.kilojoules) ? `${integerFormat.format(a.kilojoules)} kJ` : null },
			],
		},
		{
			title: 'Geschwindigkeit',
			items: [
				{ label: 'Ø Geschwindigkeit', value: formatSpeed(avgSpeed) },
				{ label: 'Max. Geschwindigkeit', value: formatSpeed(a.max_speed) },
				{ label: 'Ø Pace', value: isFoot ? formatPace(avgSpeed) : null },
				{ label: 'Ø GAP', value: formatPace(a.average_grade_adjusted_speed) },
				{
					label: 'GAP-Distanz',
					value: positive(a.grade_adjusted_distance) ? formatDistance(a.grade_adjusted_distance) : null,
				},
			],
		},
		{
			title: 'Höhe & Steigung',
			items: [
				{ label: 'Bergab', value: positive(a.elevation_loss) ? formatElevation(a.elevation_loss) : null },
				{
					label: 'Tiefster Punkt',
					value: a.elev_low !== null ? `${integerFormat.format(a.elev_low)} m` : null,
				},
				{
					label: 'Höchster Punkt',
					value: a.elev_high !== null ? `${integerFormat.format(a.elev_high)} m` : null,
				},
				{
					label: 'Max. Steigung',
					value: positive(a.max_grade) ? `${decimalFormat.format(a.max_grade)} %` : null,
				},
				{
					label: 'Ø Steigung',
					value: a.average_grade !== null ? `${decimalFormat.format(a.average_grade)} %` : null,
				},
			],
		},
		{
			title: 'Leistung & Trittfrequenz',
			items: [
				{
					label: 'Ø Leistung',
					value: positive(a.average_watts) ? `${integerFormat.format(a.average_watts)} W` : null,
				},
				{
					label: 'Gewichtete Ø-Leistung',
					value: positive(a.weighted_average_watts)
						? `${integerFormat.format(a.weighted_average_watts)} W`
						: null,
				},
				{ label: 'Ø Trittfrequenz', value: cadence(a.average_cadence) },
				{ label: 'Max. Trittfrequenz', value: cadence(a.max_cadence) },
			],
		},
		{
			title: 'Herzfrequenz & Belastung',
			items: [
				{
					label: 'Ø Herzfrequenz',
					value: positive(a.average_heartrate) ? `${integerFormat.format(a.average_heartrate)} bpm` : null,
				},
				{
					label: 'Max. Herzfrequenz',
					value: positive(a.max_heartrate) ? `${integerFormat.format(a.max_heartrate)} bpm` : null,
				},
				{
					label: 'Relative Effort',
					value: positive(a.relative_effort) ? integerFormat.format(a.relative_effort) : null,
				},
				{
					label: 'Training Load',
					value: positive(a.training_load) ? integerFormat.format(a.training_load) : null,
				},
				{ label: 'Intensität', value: positive(a.intensity) ? `${integerFormat.format(a.intensity)} %` : null },
				{
					label: 'Gefühlte Anstrengung',
					value: positive(a.perceived_exertion) ? `${integerFormat.format(a.perceived_exertion)} / 10` : null,
				},
			],
		},
		{
			title: 'Wetter',
			items: [
				{ label: 'Temperatur', value: formatTemperature(a.weather_temperature) },
				{ label: 'Gefühlt', value: formatTemperature(a.apparent_temperature) },
				{ label: 'Temperatur (Gerät)', value: formatTemperature(a.average_temp) },
				{
					label: 'Wind',
					value:
						a.wind_speed !== null
							? `${integerFormat.format(a.wind_speed * 3.6)} km/h${a.wind_bearing !== null ? ` aus ${compassDirection(a.wind_bearing)}` : ''}`
							: null,
				},
				{
					label: 'Böen',
					value: a.wind_gust !== null ? `${integerFormat.format(a.wind_gust * 3.6)} km/h` : null,
				},
				{ label: 'Luftfeuchte', value: formatPercent(a.humidity) },
				{ label: 'Bewölkung', value: formatPercent(a.cloud_cover) },
				{
					label: 'Niederschlag',
					value:
						a.precipitation_intensity !== null
							? `${decimalFormat.format(a.precipitation_intensity)} mm/h${
									a.precipitation_probability !== null
										? ` (${formatPercent(a.precipitation_probability)})`
										: ''
								}`
							: null,
				},
				{
					label: 'Luftdruck',
					value: a.weather_pressure !== null ? `${integerFormat.format(a.weather_pressure)} hPa` : null,
				},
				{ label: 'UV-Index', value: a.uv_index !== null ? String(a.uv_index) : null },
			],
		},
		{
			title: 'Sonstiges',
			items: [
				{ label: 'Schritte', value: positive(a.total_steps) ? integerFormat.format(a.total_steps) : null },
				{
					label: 'Unbefestigt',
					value:
						positive(a.dirt_distance) && a.distance
							? `${formatDistance(a.dirt_distance)} (${formatPercent(a.dirt_distance / a.distance)})`
							: null,
				},
				{
					label: 'Körpergewicht',
					value: positive(a.athlete_weight) ? `${decimalFormat.format(a.athlete_weight)} kg` : null,
				},
				{
					label: 'Radgewicht',
					value: isRide && positive(a.bike_weight) ? `${decimalFormat.format(a.bike_weight)} kg` : null,
				},
			],
		},
	];

	return groups
		.map((g) => ({ ...g, items: g.items.filter((d): d is DetailItem => Boolean(d.value)) }))
		.filter((g) => g.items.length > 0);
}

function SortableHeader({
	label,
	sortKey,
	sort,
	onSort,
	align = 'left',
}: {
	label: string;
	sortKey: SortKey;
	sort: SortOption;
	onSort: (sort: SortOption) => void;
	align?: 'left' | 'right';
}) {
	const [activeKey, activeDirection] = sort.split('-') as [SortKey, SortDirection];
	const isActive = activeKey === sortKey;
	const nextDirection: SortDirection = isActive
		? activeDirection === 'asc'
			? 'desc'
			: 'asc'
		: DEFAULT_DIRECTION[sortKey];
	const Icon = !isActive ? ChevronsUpDown : activeDirection === 'asc' ? ArrowUp : ArrowDown;

	return (
		<th
			scope="col"
			aria-sort={isActive ? (activeDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
			className={`py-2 pr-4 font-medium ${align === 'right' ? 'text-right' : ''}`}
		>
			<button
				type="button"
				onClick={() => onSort(`${sortKey}-${nextDirection}`)}
				className={`inline-flex items-center gap-1 whitespace-nowrap hover:text-gray-900 dark:hover:text-gray-100 ${
					align === 'right' ? 'flex-row-reverse' : ''
				} ${isActive ? 'text-gray-900 dark:text-gray-100' : ''}`}
			>
				{label}
				<Icon className={`h-3.5 w-3.5 ${isActive ? '' : 'opacity-40'}`} aria-hidden="true" />
			</button>
		</th>
	);
}

export function StravaDashboard({ activities, years, selectedYear, defaultYear }: StravaDashboardData) {
	const router = useRouter();
	const pathname = usePathname();
	const [isLoadingYear, startTransition] = useTransition();
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

	const types = useMemo(() => [...new Set(activities.map((a) => a.sport_type))].sort(), [activities]);

	// Server snapshot is empty; type and sort are applied after hydration.
	const search = useSyncExternalStore(
		subscribeToUrl,
		() => window.location.search,
		() => '',
	);

	const { type, sort } = useMemo<Filters>(() => {
		const params = new URLSearchParams(search);
		const urlType = params.get('type') ?? '';
		const urlSort = params.get('sort') ?? '';
		return {
			type: types.includes(urlType) ? urlType : ALL,
			sort: isSortOption(urlSort) ? urlSort : DEFAULT_SORT,
		};
	}, [search, types]);

	const updateFilters = (next: Partial<Filters>) => writeFiltersToUrl({ type, sort, ...next });
	const onSort = (next: SortOption) => updateFilters({ sort: next });

	// Year changes load new data from the server.
	const onYearChange = (value: string) => {
		const params = new URLSearchParams(window.location.search);
		if (value === defaultYear) params.delete('year');
		else params.set('year', value);
		const query = params.toString();
		startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
	};

	const filtered = useMemo(
		() => activities.filter((a) => type === ALL || a.sport_type === type).sort(compareActivities(sort)),
		[activities, type, sort],
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

	const filterLabel = [selectedYear === ALL ? 'alle Jahre' : selectedYear, type === ALL ? 'alle Typen' : type].join(
		', ',
	);

	return (
		<div className="space-y-8">
			<div className="flex flex-wrap items-end gap-4">
				<div className="flex flex-col gap-1">
					<Label htmlFor={yearId}>Jahr</Label>
					<Select
						id={yearId}
						value={selectedYear}
						onChange={(e) => onYearChange(e.target.value)}
						disabled={isLoadingYear}
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

			<section
				aria-label="Summe der gefilterten Aktivitäten"
				className="rounded-lg bg-gray-50 px-4 py-3 text-sm dark:bg-gray-900"
			>
				<p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
					Auswahl: {filterLabel}
				</p>
				<dl className="flex flex-wrap gap-x-8 gap-y-2">
					{stats.map((stat) => (
						<div key={stat.label} className="flex items-baseline gap-2">
							<dt className="text-gray-600 dark:text-gray-400">{stat.label}</dt>
							<dd className="font-semibold tabular-nums">{stat.value}</dd>
						</div>
					))}
				</dl>
			</section>

			<div
				className={`overflow-x-auto transition-opacity ${isLoadingYear ? 'opacity-50' : ''}`}
				aria-busy={isLoadingYear}
			>
				<table className="w-full text-left text-sm">
					<thead className="border-b border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400">
						<tr>
							<th className="w-8 py-2">
								<span className="sr-only">Details</span>
							</th>
							<SortableHeader label="Datum" sortKey="date" sort={sort} onSort={onSort} />
							<SortableHeader label="Typ" sortKey="type" sort={sort} onSort={onSort} />
							<SortableHeader label="Name" sortKey="name" sort={sort} onSort={onSort} />
							<SortableHeader
								label="Distanz"
								sortKey="distance"
								sort={sort}
								onSort={onSort}
								align="right"
							/>
							<SortableHeader
								label="Höhe"
								sortKey="elevation"
								sort={sort}
								onSort={onSort}
								align="right"
							/>
							<SortableHeader
								label="Dauer"
								sortKey="duration"
								sort={sort}
								onSort={onSort}
								align="right"
							/>
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
												<div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
													{getDetails(a).map((group) => (
														<section key={group.title}>
															<h3 className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
																{group.title}
															</h3>
															<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
																{group.items.map((d) => (
																	<Fragment key={d.label}>
																		<dt className="text-gray-600 dark:text-gray-400">
																			{d.label}
																		</dt>
																		<dd className="font-medium tabular-nums">
																			{d.value}
																		</dd>
																	</Fragment>
																))}
															</dl>
														</section>
													))}
												</div>
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
