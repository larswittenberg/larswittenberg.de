import type { Metadata } from 'next';
import LayoutDefault from '@/components/LayoutDefault';
import { DataSourceIndicator } from '@/components/projects/github-stars/data-source-indicator';
import { GithubStarsPage } from '@/components/projects/github-stars/github-stars-page';
import { SORT_OPTION_LABELS, type SortOption } from '@/lib/projects/github-stars/constants';

export const metadata: Metadata = {
	title: 'Meine GitHub Stars',
};

type PageProps = {
	searchParams?: Record<string, string | string[] | undefined>;
};

const DEFAULT_SORT: SortOption = 'starred-desc';

const isSortOption = (value: string): value is SortOption => value in SORT_OPTION_LABELS;

export default async function IndexPage({ searchParams }: PageProps) {
	const resolvedSearchParams = (await searchParams) ?? {};
	const rawQuery = typeof resolvedSearchParams?.query === 'string' ? resolvedSearchParams.query : '';
	const rawSort = typeof resolvedSearchParams?.sort === 'string' ? resolvedSearchParams.sort : DEFAULT_SORT;
	const sortOption = isSortOption(rawSort) ? rawSort : DEFAULT_SORT;

	return (
		<LayoutDefault fullWidth>
			<GithubStarsPage initialQuery={rawQuery} initialSort={sortOption} />
			<DataSourceIndicator />
		</LayoutDefault>
	);
}
