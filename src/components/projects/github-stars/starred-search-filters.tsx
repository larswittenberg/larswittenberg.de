'use client';

import { useId } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { Input } from '@/components/projects/github-stars/ui/input';
import { Select } from '@/components/projects/github-stars/ui/select';
import { Label } from '@/components/projects/github-stars/ui/label';
// import { Button } from '@/components/projects/github-stars/ui/button';
import type { RateLimitInfo } from '@/lib/projects/github-stars/dataClient';
import { SORT_OPTION_LABELS, type SortOption } from '@/lib/projects/github-stars/constants';

type FiltersProps = {
	query: string;
	onQueryChange: (value: string) => void;
	sortOption: SortOption;
	onSortOptionChange: (value: SortOption) => void;
	rateLimit: RateLimitInfo;
	formattedResetTime: string | null;
	totalStarredFormatted: string;
	cacheLabel: string | null;
	isCacheLoading: boolean;
	isRefreshing: boolean;
	isPending: boolean;
	onRefreshCache: () => void;
};

export function StarredSearchFilters(props: FiltersProps) {
	const {
		query,
		onQueryChange,
		sortOption,
		onSortOptionChange,
		totalStarredFormatted,
		cacheLabel,
		isCacheLoading,
		isRefreshing,
		// isPending,
		// rateLimit,
		// formattedResetTime,
		// onRefreshCache,
	} = props;

	const queryInputId = useId();
	const sortSelectId = useId();

	const disableControls = isCacheLoading || isRefreshing;
	const showCacheSpinner = isCacheLoading || isRefreshing;
	// const disableRefresh = disableControls || isPending;

	return (
		<section className="mb-16 space-y-4 p-4">
			<header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold">
						<a
							href="https://github.com/larswittenberg?tab=stars"
							target="_blank"
							rel="noreferrer"
							className="text-primary inline-flex items-center gap-2 transition-colors hover:underline"
						>
							<span>Meine GitHub Stars</span>
							{totalStarredFormatted && <span className="text-primary">({totalStarredFormatted})</span>}
							<ExternalLink className="h-4 w-4" aria-hidden="true" />
						</a>{' '}
					</h1>
				</div>
				<div className="text-muted-foreground text-xs">
					<p className="text-muted-foreground mt-1 text-xs">
						Datenstand:
						<span className="ml-1 inline-flex items-center gap-2 align-middle">
							{showCacheSpinner ? (
								<>
									<span
										className="border-primary h-3 w-3 animate-spin rounded-full border-2 border-t-transparent"
										aria-hidden="true"
									/>
									<span>Wird aktualisiert…</span>
								</>
							) : (
								(cacheLabel ?? 'wird geladen…')
							)}
						</span>
					</p>
					{/* <span className="font-medium">
							Rate Limit:{' '}
							{rateLimit.remaining !== null && rateLimit.limit !== null
								? `${rateLimit.remaining} / ${rateLimit.limit}`
								: 'unbekannt'}
						</span>
						{formattedResetTime && (
							<>
								<br />
								<span>Reset um {formattedResetTime}</span>
							</>
						)} */}
				</div>
			</header>

			<div className="flex flex-col items-center gap-6">
				<div className="w-full max-w-2xl text-center">
					<Label htmlFor={queryInputId} className="sr-only">
						Volltextsuche nach Name, Beschreibung, Topics oder Besitzer. (mindestens drei Zeichen)
					</Label>
					<div className="relative">
						<Input
							id={queryInputId}
							placeholder="Suche nach Name, Beschreibung, Topics oder Besitzer (min. 3 Zeichen)"
							value={query}
							onChange={(event) => onQueryChange(event.target.value)}
							disabled={disableControls}
							autoComplete="off"
							autoFocus
							className={`border-primary/20 bg-background focus-visible:border-primary focus-visible:ring-primary/30 h-14 w-full rounded-full border-2 text-base shadow-sm transition md:text-lg ${
								query.length > 0 ? 'pr-10 pl-6 md:pr-20' : 'px-4 md:px-6'
							}`}
						/>
						{query.length > 0 ? (
							<button
								type="button"
								className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-4 flex items-center transition-colors"
								onClick={() => onQueryChange('')}
								disabled={disableControls}
								aria-label="Suche zurücksetzen"
							>
								<X className="h-5 w-5" aria-hidden="true" />
							</button>
						) : null}
					</div>
				</div>
			</div>

			<div className="flex flex-wrap items-center justify-center gap-3">
				<div className="flex max-w-4xl flex-col items-center gap-1 sm:flex-row sm:justify-end">
					<Label htmlFor={sortSelectId} className="sr-only">
						Sortierung
					</Label>{' '}
					<Select
						id={sortSelectId}
						value={sortOption}
						onChange={(event) => onSortOptionChange(event.target.value as SortOption)}
						disabled={disableControls}
						className="border-muted bg-muted/30 text-muted-foreground h-9 w-72 rounded-full border px-4 text-sm focus-visible:ring-0"
					>
						{(Object.keys(SORT_OPTION_LABELS) as SortOption[]).map((value) => (
							<option key={value} value={value}>
								{SORT_OPTION_LABELS[value]}
							</option>
						))}
					</Select>
				</div>
				{/* <div className="flex items-center gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={onRefreshCache}
						disabled={disableRefresh}
					>
						{isRefreshing ? (
							<span className="inline-flex items-center gap-2">
								<span
									className="border-primary h-3 w-3 animate-spin rounded-full border-2 border-t-transparent"
									aria-hidden="true"
								/>
								<span>Aktualisiere Cache…</span>
							</span>
						) : (
							'Cache aktualisieren'
						)}
					</Button>
				</div> */}
			</div>
		</section>
	);
}
