import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import {
	type FetchStarredRepositoriesOptions,
	type FetchStarredRepositoriesResult,
	type GitHubRepository,
} from '@/lib/projects/github-stars/github';

export type {
	GitHubRepository,
	FetchStarredRepositoriesOptions,
	FetchStarredRepositoriesResult,
	RateLimitInfo,
} from '@/lib/projects/github-stars/github';

type DataSource = 'live' | 'mock';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'starred-repositories.json');

const ownerSchema = z.object({
	login: z.string(),
	avatarUrl: z.string().url(),
});

const repositorySchema = z.object({
	name: z.string(),
	description: z.string().nullable(),
	url: z.string().url(),
	stargazerCount: z.number(),
	forkCount: z.number(),
	pushedAt: z.string(),
	owner: ownerSchema,
	primaryLanguage: z.object({ name: z.string(), color: z.string().nullable() }).nullable(),
	repositoryTopics: z.array(z.string()),
});

const starredRepositoriesSchema = z.array(repositorySchema);

const generatedAtSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
	message: 'generatedAt must be a valid ISO-8601 timestamp',
});

const starredRepositoriesFileSchema = z.object({
	generatedAt: generatedAtSchema,
	repositories: starredRepositoriesSchema,
});

const isNotFoundError = (error: unknown): boolean => {
	if (!error || typeof error !== 'object') {
		return false;
	}

	return 'code' in error && (error as { code?: string | number }).code === 'ENOENT';
};

const resolveDataSource = (): DataSource => 'mock';

export const getActiveDataSource = (): DataSource => resolveDataSource();

export const isMockDataSource = (): boolean => true;

export const getActiveDataSourceLabel = (): string => 'Lokale JSON-Daten';

const loadMockStarredRepositories = async (): Promise<FetchStarredRepositoriesResult> => {
	try {
		const stats = await fs.stat(DATA_FILE);
		const raw = await fs.readFile(DATA_FILE, 'utf8');
		const parsed = JSON.parse(raw) as unknown;

		let generatedAt: string | null = null;
		let parsedReposInput: unknown;

		if (Array.isArray(parsed)) {
			parsedReposInput = parsed;
		} else {
			const parsedFile = starredRepositoriesFileSchema.parse(parsed);
			generatedAt = parsedFile.generatedAt;
			parsedReposInput = parsedFile.repositories;
		}

		const parsedRepos = starredRepositoriesSchema.parse(parsedReposInput);

		const repositories: GitHubRepository[] = parsedRepos.map((repo) => ({
			id: repo.url, // Use URL as a unique ID
			name: repo.name,
			full_name: `${repo.owner.login}/${repo.name}`,
			description: repo.description,
			html_url: repo.url,
			stargazers_count: repo.stargazerCount,
			updated_at: repo.pushedAt,
			language: repo.primaryLanguage?.name ?? null,
			topics: repo.repositoryTopics,
			owner: {
				login: repo.owner.login,
				html_url: `https://github.com/${repo.owner.login}`,
				avatarUrl: repo.owner.avatarUrl,
			},
			archived: false, // Assuming fetched repos are not archived
			starred_at: null, // This info is not in the new data
		}));

		const totalStarred = repositories.length;
		const dataTimestamp = generatedAt ? Date.parse(generatedAt) : stats.mtime.getTime();

		return {
			repositories,
			allRepositories: repositories,
			rateLimit: { limit: 5000, remaining: 5000, reset: Date.now() + 3600000 }, // Mock rate limit
			totalStarred,
			dataTimestamp,
		};
	} catch (error) {
		if (isNotFoundError(error)) {
			throw new Error(
				`Daten-Datei ${path.relative(process.cwd(), DATA_FILE)} wurde nicht gefunden. Bitte führe das Skript zum Abrufen der Daten aus.`,
			);
		}

		if (error instanceof z.ZodError) {
			throw new Error(
				[
					`Daten-JSON in ${path.relative(process.cwd(), DATA_FILE)} entspricht nicht dem erwarteten Schema.`,
					...error.issues.map((issue) => `- ${issue.path.join('.') || '(root)'}: ${issue.message}`),
				].join('\n'),
			);
		}

		throw error instanceof Error
			? new Error(`Daten konnten nicht geladen werden: ${error.message}`)
			: new Error('Unbekannter Fehler beim Lesen der Daten.');
	}
};

export const getStarredRepositories = async (
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_options: FetchStarredRepositoriesOptions = {},
): Promise<FetchStarredRepositoriesResult> => {
	return loadMockStarredRepositories();
};
