import { sortRepositories } from '@/lib/projects/github-stars/utils/sort-repositories';
import { filterRepositories } from '@/lib/projects/github-stars/utils/filter-repositories';
import { StarredRepositoryList } from '@/components/projects/github-stars/starred-repository-list';
import { getStarredRepositories } from '@/lib/projects/github-stars/dataClient';
import { MIN_QUERY_LENGTH, type SortOption } from '@/lib/projects/github-stars/constants';

type StarredResultsProps = {
	query: string;
	sortOption: SortOption;
};

const createSummary = (query: string, count: number): string => {
	const trimmedQuery = query.trim();
	if (trimmedQuery.length < MIN_QUERY_LENGTH) {
		return `Alle ${count} gespeicherten Repositories werden angezeigt.`;
	}

	if (count === 0) {
		return `Keine Repositories für "${trimmedQuery}" gefunden.`;
	}

	const repoWording = count === 1 ? 'Repository' : 'Repositories';
	return `${count} ${repoWording} für "${trimmedQuery}" gefunden.`;
};

export async function StarredResults(props: StarredResultsProps) {
	const { query, sortOption } = props;
	const configuredUsername = process.env.GH_USERNAME;
	const normalizedUsername = configuredUsername?.trim();
	const username = normalizedUsername && normalizedUsername.length > 0 ? normalizedUsername : 'larswittenberg';

	let repositories;
	let error: Error | null = null;

	try {
		const data = await getStarredRepositories({ username });
		repositories = data.repositories;
	} catch (err) {
		error = err instanceof Error ? err : new Error('Unbekannter Fehler beim Laden der Repository-Daten.');
	}

	if (error) {
		return (
			<div className="border-destructive/50 bg-destructive/10 space-y-4 rounded-lg border p-4">
				<h2 className="text-destructive font-semibold">Fehler beim Laden der Repositories</h2>
				<p className="text-muted-foreground text-sm">{error.message}</p>
			</div>
		);
	}

	const filtered = filterRepositories(repositories, query);
	const sorted = sortRepositories(filtered, sortOption);
	const summary = createSummary(query, sorted.length);

	return (
		<div className="space-y-4">
			<p className="text-muted-foreground text-sm">{summary}</p>
			<StarredRepositoryList repositories={sorted} />
		</div>
	);
}
