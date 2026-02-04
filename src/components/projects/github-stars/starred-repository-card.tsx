import { ExternalLink, Star } from 'lucide-react';
import type { GitHubRepository } from '@/lib/projects/github-stars/dataClient';

type CardProps = {
	repository: GitHubRepository;
	position: number;
};

export function StarredRepositoryCard(props: CardProps) {
	const { repository, position } = props;

	return (
		<li className="rounded-lg border border-gray-500 p-6">
			<div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h2 className="text-primary flex flex-wrap items-center gap-2 text-base font-semibold sm:flex-nowrap lg:text-xl">
						<span>{position}.</span>
						<span className="wrap-break-words">{repository.full_name}</span>
						<span className="text-muted-foreground flex items-center gap-1 text-sm font-normal">
							<Star className="fill-red h-3 w-3" aria-hidden="true" />
							{repository.stargazers_count.toLocaleString('de-DE')}
						</span>
					</h2>
					{repository.description && (
						<p className="text-muted-foreground mt-1 text-sm">{repository.description}</p>
					)}
					{(repository.language || repository.topics.length > 0) && (
						<ul className="text-muted-foreground mt-3 flex flex-wrap gap-2 text-xs">
							{repository.language && (
								<li className="leading-5">
									<span className="bg-muted/60 text-muted-foreground rounded-full px-2 py-0.5 font-medium">
										{repository.language}
									</span>
								</li>
							)}
							{repository.topics.map((topic) => (
								<li key={topic} className="leading-5">
									<span className="opacity-80">#{topic}</span>
								</li>
							))}
						</ul>
					)}
				</div>
				<a
					href={repository.html_url}
					target="_blank"
					rel="noreferrer"
					className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex h-9 items-center justify-center gap-1 rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors sm:shrink-0"
				>
					<span>Auf GitHub öffnen</span>
					<ExternalLink className="h-4 w-4" aria-hidden="true" />
				</a>
			</div>
		</li>
	);
}
