'use client';

import { useState, useCallback, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StarredSearchFilters } from '@/components/projects/github-stars/starred-search-filters';
import type { RateLimitInfo } from '@/lib/projects/github-stars/dataClient';
import { MIN_QUERY_LENGTH, type SortOption } from '@/lib/projects/github-stars/constants';

type Props = {
	query: string;
	sortOption: SortOption;
};

const skeletonRateLimit: RateLimitInfo = {
	limit: null,
	remaining: null,
	reset: null,
};

export function StarredSearchSkeleton(props: Props) {
	const { query, sortOption } = props;

	const router = useRouter();
	const searchParams = useSearchParams();
	const [localQuery, setLocalQuery] = useState(query);
	const [prevQuery, setPrevQuery] = useState(query);
	const [isPending, startTransition] = useTransition();

	// Sync localQuery when query prop changes (React-recommended pattern for adjusting state during render)
	if (query !== prevQuery && !isPending) {
		setPrevQuery(query);
		setLocalQuery(query);
	}

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

	useEffect(() => {
		if (isPending) {
			return;
		}

		if (localQuery === query) {
			return;
		}

		const trimmed = localQuery.trim();
		const shouldUpdate = trimmed.length === 0 || trimmed.length >= MIN_QUERY_LENGTH;

		if (!shouldUpdate) {
			return;
		}

		const handler = setTimeout(() => {
			updateSearchParams({
				query: trimmed.length > 0 ? trimmed : null,
			});
		}, 400);

		return () => {
			clearTimeout(handler);
		};
	}, [localQuery, query, isPending, updateSearchParams]);

	const handleSortChange = (value: SortOption) => {
		if (value === sortOption) {
			return;
		}

		updateSearchParams({ sort: value });
	};

	return (
		<StarredSearchFilters
			query={localQuery}
			onQueryChange={setLocalQuery}
			sortOption={sortOption}
			onSortOptionChange={handleSortChange}
			rateLimit={skeletonRateLimit}
			formattedResetTime="…"
			totalStarredFormatted="…"
			cacheLabel="Lade…"
			isCacheLoading={true}
			isRefreshing={false}
			isPending={isPending}
			onRefreshCache={() => {}}
		/>
	);
}
