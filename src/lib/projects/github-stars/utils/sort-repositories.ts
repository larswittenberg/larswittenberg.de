import type { GitHubRepository } from '@/lib/projects/github-stars/dataClient';
import type { SortOption } from '@/lib/projects/github-stars/constants';
import { toTimestamp } from '@/lib/projects/github-stars/utils/to-timestamp';

const compareDates = (a: string | null | undefined, b: string | null | undefined) => {
	const dateA = toTimestamp(a);
	const dateB = toTimestamp(b);

	if (dateA === null && dateB === null) {
		return 0;
	}
	if (dateA === null) {
		return -1;
	}
	if (dateB === null) {
		return 1;
	}

	return dateA - dateB;
};

export const sortRepositories = (repositories: GitHubRepository[], sortOption: SortOption): GitHubRepository[] => {
	const candidates = [...repositories];

	candidates.sort((a, b) => {
		switch (sortOption) {
			case 'starred-asc':
				return compareDates(a.starred_at, b.starred_at);
			case 'starred-desc':
				return compareDates(b.starred_at, a.starred_at);
			case 'updated-asc':
				return compareDates(a.updated_at, b.updated_at);
			case 'updated-desc':
				return compareDates(b.updated_at, a.updated_at);
			case 'name-asc':
				return a.full_name.localeCompare(b.full_name);
			case 'name-desc':
				return b.full_name.localeCompare(a.full_name);
			case 'stars-asc':
				return a.stargazers_count - b.stargazers_count;
			case 'stars-desc':
				return b.stargazers_count - a.stargazers_count;
			default:
				return 0;
		}
	});

	return candidates;
};
