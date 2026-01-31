import type { GitHubRepository } from '@/lib/projects/github-stars/dataClient';
import { MIN_QUERY_LENGTH } from '@/lib/projects/github-stars/constants';

export const filterRepositories = (repositories: GitHubRepository[], query: string): GitHubRepository[] => {
	const trimmed = query.trim();
	if (trimmed.length < MIN_QUERY_LENGTH) {
		return repositories;
	}

	const lowerQuery = trimmed.toLowerCase();

	return repositories.filter((repository) => {
		const haystack = [
			repository.name,
			repository.full_name,
			repository.description ?? '',
			repository.owner.login,
			repository.owner.html_url,
			...(repository.topics ?? []),
		]
			.join(' ')
			.toLowerCase();

		return haystack.includes(lowerQuery);
	});
};
