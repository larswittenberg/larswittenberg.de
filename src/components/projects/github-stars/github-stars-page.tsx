'use client';

import { useState, useEffect, useMemo, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/lib/projects/github-stars/utils/use-debounce';
import { filterRepositories } from '@/lib/projects/github-stars/utils/filter-repositories';
import { sortRepositories } from '@/lib/projects/github-stars/utils/sort-repositories';
import { StarredSearchFilters } from '@/components/projects/github-stars/starred-search-filters';
import { StarredRepositoryList } from '@/components/projects/github-stars/starred-repository-list';
import { StarredResultsSkeleton } from '@/components/projects/github-stars/starred-results-skeleton';
import { MIN_QUERY_LENGTH, type SortOption } from '@/lib/projects/github-stars/constants';
import type { FetchStarredRepositoriesResult, GitHubRepository } from '@/lib/projects/github-stars/dataClient';

type GithubStarsPageProps = {
	initialQuery: string;
	initialSort: SortOption;
};

const numberFormatter = new Intl.NumberFormat('de-DE');
const cacheDateFormatter = new Intl.DateTimeFormat('de-DE', {
	dateStyle: 'medium',
	timeStyle: 'short',
	timeZone: 'Europe/Berlin',
});

function formatResetTime(reset: number | null): string | null {
	if (reset === null) return null;
	const date = new Date(reset * 1000);
	return date.toLocaleTimeString('de-DE', { timeZone: 'Europe/Berlin' });
}

export function GithubStarsPage({ initialQuery, initialSort }: GithubStarsPageProps) {
	const [allRepos, setAllRepos] = useState<GitHubRepository[]>([]);
	const [data, setData] = useState<FetchStarredRepositoriesResult | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [dataTimestamp, setDataTimestamp] = useState<number | null>(null);

	const [query, setQuery] = useState(initialQuery);
	const [sortOption, setSortOption] = useState<SortOption>(initialSort);

	const [isSearching, setIsSearching] = useState(false);

	const debouncedQuery = useDebounce(query, 300);

	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		if (debouncedQuery.trim().length >= MIN_QUERY_LENGTH) {
			setIsSearching(true);
		} else {
			setIsSearching(false);
		}
	}, [debouncedQuery]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				const response = await fetch('/api/github-starred');
				if (!response.ok) {
					throw new Error(`API responded with status ${response.status}`);
				}
				const result: FetchStarredRepositoriesResult = await response.json();
				setData(result);
				setAllRepos(result.allRepositories);
				setDataTimestamp(result.dataTimestamp ?? null);
			} catch (e) {
				setError(e instanceof Error ? e.message : 'An unknown error occurred');
			}
			setIsLoading(false);
		};

		fetchData();
	}, []);

	const updateSearchParams = useCallback(
		(next: Record<string, string | null>) => {
			const current = new URLSearchParams(searchParams?.toString());
			Object.entries(next).forEach(([key, value]) => {
				if (value === null || value.length === 0) {
					current.delete(key);
				} else {
					current.set(key, value);
				}
			});

			startTransition(() => {
				router.replace(`?${current.toString()}`, { scroll: false });
			});
		},
		[router, searchParams, startTransition],
	);

	const handleQueryChange = (newQuery: string) => {
		setQuery(newQuery);
		updateSearchParams({ query: newQuery });
	};

	const handleSortChange = (newSort: SortOption) => {
		setSortOption(newSort);
		updateSearchParams({ sort: newSort });
	};

	const filteredRepos = useMemo(() => {
		if (!isSearching) {
			return allRepos;
		}
		return filterRepositories(allRepos, debouncedQuery);
	}, [allRepos, debouncedQuery, isSearching]);

	const sortedRepos = useMemo(() => {
		return sortRepositories(filteredRepos, sortOption);
	}, [filteredRepos, sortOption]);

	const initialRepos = useMemo(() => {
		const newest = sortRepositories(allRepos, 'starred-desc');
		return newest.slice(0, 10);
	}, [allRepos]);

	const reposToDisplay = isSearching ? sortedRepos : initialRepos;

	const summary = useMemo(() => {
		if (!isSearching) {
			return `Zeige die ${initialRepos.length} neuesten von insgesamt ${allRepos.length} gespeicherten Repositories.`;
		}

		const trimmedQuery = debouncedQuery.trim();
		if (sortedRepos.length === 0) {
			return `Keine Repositories für "${trimmedQuery}" gefunden.`;
		}

		const repoWording = sortedRepos.length === 1 ? 'Repository' : 'Repositories';
		return `${sortedRepos.length} ${repoWording} für "${trimmedQuery}" gefunden.`;
	}, [isSearching, debouncedQuery, sortedRepos.length, allRepos.length, initialRepos.length]);

	const cacheLabel = useMemo(() => {
		if (!dataTimestamp) return null;
		return cacheDateFormatter.format(new Date(dataTimestamp));
	}, [dataTimestamp]);

	if (isLoading) {
		return (
			<div className="space-y-8 py-10">
				<StarredSearchFilters
					query={query}
					onQueryChange={handleQueryChange}
					sortOption={sortOption}
					onSortOptionChange={handleSortChange}
					rateLimit={{ limit: null, remaining: null, reset: null }}
					formattedResetTime={null}
					totalStarredFormatted={''}
					cacheLabel={null}
					isCacheLoading={true}
					isRefreshing={false}
					isPending={isPending}
					onRefreshCache={() => {}}
				/>
				<StarredResultsSkeleton />
			</div>
		);
	}

	if (error) {
		return <div className="text-destructive">Error: {error}</div>;
	}

	if (!data) {
		return null;
	}

	return (
		<div className="space-y-8 py-10">
			<StarredSearchFilters
				query={query}
				onQueryChange={handleQueryChange}
				sortOption={sortOption}
				onSortOptionChange={handleSortChange}
				rateLimit={data.rateLimit}
				formattedResetTime={formatResetTime(data.rateLimit.reset)}
				totalStarredFormatted={numberFormatter.format(data.totalStarred)}
				cacheLabel={cacheLabel}
				isCacheLoading={isLoading}
				isRefreshing={false}
				isPending={isPending}
				onRefreshCache={() => {}}
			/>
			<div className="space-y-4">
				<p className="text-muted-foreground text-sm">{summary}</p>
				<StarredRepositoryList repositories={reposToDisplay} />
			</div>
		</div>
	);
}
