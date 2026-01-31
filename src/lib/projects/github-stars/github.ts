export type GitHubOwner = {
	login: string;
	html_url: string;
	avatarUrl?: string;
};

export type GitHubRepository = {
	id: string;
	name: string;
	full_name: string;
	description: string | null;
	html_url: string;
	language: string | null;
	stargazers_count: number;
	topics: string[];
	archived: boolean;
	updated_at: string;
	owner: GitHubOwner;
	starred_at: string | null;
	forkCount?: number;
	pushedAt?: string;
	primaryLanguage?: { name: string; color: string | null } | null;
	repositoryTopics?: string[];
	url?: string;
	stargazerCount?: number;
};

export type RateLimitInfo = {
	limit: number | null;
	remaining: number | null;
	reset: number | null;
};

export type FetchStarredRepositoriesOptions = {
	perPage?: number;
	page?: number;
	username?: string;
};

export type FetchStarredRepositoriesResult = {
	repositories: GitHubRepository[];
	allRepositories: GitHubRepository[];
	rateLimit: RateLimitInfo;
	totalStarred: number;
	dataTimestamp?: number;
};

export class GitHubApiError extends Error {
	status: number;
	responseBody?: unknown;
	constructor(message: string, status: number, responseBody?: unknown) {
		super(message);
		this.name = 'GitHubApiError';
		this.status = status;
		this.responseBody = responseBody;
	}
}
