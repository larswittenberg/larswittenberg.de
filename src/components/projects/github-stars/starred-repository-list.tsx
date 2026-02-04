import type { GitHubRepository } from '@/lib/projects/github-stars/dataClient';
import { StarredRepositoryCard } from '@/components/projects/github-stars/starred-repository-card';

type RepositoryListProps = {
	repositories: GitHubRepository[];
	positionOffset?: number;
};

export function StarredRepositoryList(props: RepositoryListProps) {
	const { repositories, positionOffset = 0 } = props;

	if (repositories.length === 0) {
		return (
			<section className="space-y-4">
				<p className="text-muted-foreground text-sm">Keine Repositories gefunden.</p>
			</section>
		);
	}

	return (
		<section className="space-y-4">
			<ol className="space-y-8">
				{repositories.map((repository, index) => (
					<StarredRepositoryCard
						key={repository.id}
						repository={repository}
						position={positionOffset + index + 1}
					/>
				))}
			</ol>
		</section>
	);
}
