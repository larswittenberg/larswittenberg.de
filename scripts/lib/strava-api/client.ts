import fs from 'node:fs';
import path from 'node:path';
import type { DetailedActivity, DetailedAthlete, StoredTokens, SummaryActivity, TokenResponse } from './types';

const API_URL = 'https://www.strava.com/api/v3';
export const OAUTH_URL = 'https://www.strava.com/oauth';
export const TOKEN_FILE = 'data/strava-tokens.json';
export const REQUIRED_SCOPE = 'activity:read_all';

const WINDOW_MS = 15 * 60 * 1000;
const SHORT_TERM_BUFFER = 5;
const DAILY_BUFFER = 5;
const REFRESH_MARGIN_S = 300;
const MAX_SERVER_RETRIES = 3;
const MAX_RATE_LIMIT_RETRIES = 3;

export const isCI = process.env.CI === 'true';

export class StravaApiError extends Error {
	readonly status: number;
	constructor(message: string, status: number) {
		super(message);
		this.name = 'StravaApiError';
		this.status = status;
	}
}

export class NotFoundError extends StravaApiError {
	constructor(pathname: string) {
		super(`Nicht gefunden: ${pathname}`, 404);
		this.name = 'NotFoundError';
	}
}

export class StravaAuthError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'StravaAuthError';
	}
}

export class DailyLimitReachedError extends Error {
	constructor() {
		super('Tageslimit der Strava-API erreicht (Reset um 00:00 UTC).');
		this.name = 'DailyLimitReachedError';
	}
}

export class ShortTermLimitReachedError extends Error {
	constructor() {
		super('15-min-Limit der Strava-API erreicht (kein Warten wegen --no-wait bzw. CI).');
		this.name = 'ShortTermLimitReachedError';
	}
}

/** Loads .env.local if present; existing environment variables take precedence. */
export function loadEnv(file = '.env.local') {
	if (fs.existsSync(file)) process.loadEnvFile(file);
}

export function getClientCredentials() {
	const clientId = process.env.STRAVA_CLIENT_ID;
	const clientSecret = process.env.STRAVA_CLIENT_SECRET;
	if (!clientId || !clientSecret) {
		throw new StravaAuthError('STRAVA_CLIENT_ID und STRAVA_CLIENT_SECRET fehlen (.env.local bzw. CI-Secrets).');
	}
	return { clientId, clientSecret };
}

/** POST /oauth/token; the response body is never included in errors because it may contain tokens. */
export async function requestToken(params: Record<string, string>): Promise<TokenResponse> {
	const { clientId, clientSecret } = getClientCredentials();
	const res = await fetch(`${OAUTH_URL}/token`, {
		method: 'POST',
		body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, ...params }),
	});
	if (!res.ok) {
		throw new StravaAuthError(
			`Token-Anfrage fehlgeschlagen (HTTP ${res.status}). "yarn strava:auth" erneut ausführen bzw. STRAVA_REFRESH_TOKEN erneuern.`,
		);
	}
	return (await res.json()) as TokenResponse;
}

export interface TokenStore {
	readonly description: string;
	load(): StoredTokens | null;
	save(tokens: StoredTokens): void;
}

const tokensFromEnv = (): StoredTokens | null => {
	const refreshToken = process.env.STRAVA_REFRESH_TOKEN;
	return refreshToken
		? { access_token: null, refresh_token: refreshToken, expires_at: 0, athlete_id: null, scope: null }
		: null;
};

/** Local default; falls back to STRAVA_REFRESH_TOKEN and creates the file on the first refresh. */
export class FileTokenStore implements TokenStore {
	readonly description: string;
	private readonly file: string;

	constructor(file = TOKEN_FILE) {
		this.file = file;
		this.description = file;
	}

	load() {
		if (!fs.existsSync(this.file)) return tokensFromEnv();
		return JSON.parse(fs.readFileSync(this.file, 'utf8')) as StoredTokens;
	}

	save(tokens: StoredTokens) {
		fs.mkdirSync(path.dirname(this.file), { recursive: true });
		fs.writeFileSync(this.file, `${JSON.stringify(tokens, null, '\t')}\n`, { mode: 0o600 });
		fs.chmodSync(this.file, 0o600);
	}
}

/** CI: reads STRAVA_REFRESH_TOKEN, keeps tokens in memory only. */
export class EnvTokenStore implements TokenStore {
	readonly description = 'STRAVA_REFRESH_TOKEN (Env)';
	refreshTokenRotated = false;
	private tokens: StoredTokens | null = null;

	load() {
		return this.tokens ?? tokensFromEnv();
	}

	save(tokens: StoredTokens) {
		const previous = this.tokens?.refresh_token ?? process.env.STRAVA_REFRESH_TOKEN;
		this.tokens = tokens;
		if (tokens.refresh_token === previous) return;
		this.refreshTokenRotated = true;
		console.warn('WARNUNG: Strava hat einen neuen Refresh-Token ausgegeben – Secret STRAVA_REFRESH_TOKEN aktualisieren!');
		const file = process.env.STRAVA_ROTATED_TOKEN_FILE;
		if (file) {
			fs.writeFileSync(file, tokens.refresh_token, { mode: 0o600 });
			console.warn(`  Neuer Token liegt in ${file} (per stdin an "gh secret set" übergeben, nicht ausgeben).`);
		}
	}
}

export function createTokenStore(): TokenStore {
	return process.env.STRAVA_TOKEN_STORE === 'env' || isCI ? new EnvTokenStore() : new FileTokenStore();
}

let tokenStore: TokenStore | null = null;
let tokens: StoredTokens | null = null;
let waitForRateLimit = true;

export function configureClient(options: { tokenStore?: TokenStore; wait?: boolean }) {
	if (options.tokenStore) tokenStore = options.tokenStore;
	if (options.wait !== undefined) waitForRateLimit = options.wait;
}

export function getTokenStore(): TokenStore {
	tokenStore ??= createTokenStore();
	return tokenStore;
}

async function getAccessToken(forceRefresh = false): Promise<string> {
	const store = getTokenStore();
	const current = tokens ?? store.load();
	if (!current) {
		throw new StravaAuthError(`Keine Strava-Tokens gefunden (${store.description}). Bitte "yarn strava:auth" ausführen.`);
	}
	if (!forceRefresh && current.access_token && current.expires_at - REFRESH_MARGIN_S > Date.now() / 1000) {
		tokens = current;
		return current.access_token;
	}
	const res = await requestToken({ grant_type: 'refresh_token', refresh_token: current.refresh_token });
	// Strava may rotate the refresh token; always persist the latest one.
	tokens = { ...current, access_token: res.access_token, refresh_token: res.refresh_token, expires_at: res.expires_at };
	store.save(tokens);
	return res.access_token;
}

export type RateLimitUsage = { shortLimit: number; shortUsage: number; dailyLimit: number; dailyUsage: number };

export type RateLimitState = { overall: RateLimitUsage | null; read: RateLimitUsage | null; updatedAt: number };

let rateLimit: RateLimitState = { overall: null, read: null, updatedAt: 0 };

/** Parses "<15min>,<daily>" limit/usage header pairs. */
export function parseRateLimitHeaders(limitHeader: string | null, usageHeader: string | null): RateLimitUsage | null {
	const parse = (value: string | null) => value?.split(',').map((n) => Number(n.trim())) ?? [];
	const limit = parse(limitHeader);
	const usage = parse(usageHeader);
	if (limit.length < 2 || usage.length < 2 || [...limit, ...usage].some((n) => Number.isNaN(n))) return null;
	return { shortLimit: limit[0], dailyLimit: limit[1], shortUsage: usage[0], dailyUsage: usage[1] };
}

/** Remaining requests; usage from a past 15-min window (:00/:15/:30/:45) or UTC day no longer counts. */
export function getRemainingRequests(state: RateLimitState, now = Date.now()) {
	const sameWindow = Math.floor(state.updatedAt / WINDOW_MS) === Math.floor(now / WINDOW_MS);
	const sameDay = new Date(state.updatedAt).toISOString().slice(0, 10) === new Date(now).toISOString().slice(0, 10);
	let short = Infinity;
	let daily = Infinity;
	for (const usage of [state.overall, state.read]) {
		if (!usage) continue;
		if (sameWindow) short = Math.min(short, usage.shortLimit - usage.shortUsage);
		if (sameDay) daily = Math.min(daily, usage.dailyLimit - usage.dailyUsage);
	}
	return { short, daily };
}

export function getRateLimitState(): RateLimitState {
	return rateLimit;
}

export function formatRateLimit(state = rateLimit): string {
	const usage = state.read ?? state.overall;
	if (!usage) return 'Rate-Limit: noch unbekannt';
	return `Rate-Limit: 15 min ${usage.shortUsage}/${usage.shortLimit}, Tag ${usage.dailyUsage}/${usage.dailyLimit}`;
}

function updateRateLimit(headers: Headers) {
	const overall = parseRateLimitHeaders(headers.get('x-ratelimit-limit'), headers.get('x-ratelimit-usage'));
	const read = parseRateLimitHeaders(headers.get('x-readratelimit-limit'), headers.get('x-readratelimit-usage'));
	if (!overall && !read) return;
	rateLimit = { overall: overall ?? rateLimit.overall, read: read ?? rateLimit.read, updatedAt: Date.now() };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForNextWindow(reason: string) {
	if (!waitForRateLimit) throw new ShortTermLimitReachedError();
	const until = (Math.floor(Date.now() / WINDOW_MS) + 1) * WINDOW_MS + 5000;
	console.log(`  ${reason} – warte bis ${new Date(until).toLocaleTimeString('de-DE')} (nächstes 15-min-Fenster)`);
	for (let left = until - Date.now(); left > 0; left = until - Date.now()) {
		console.log(`    noch ${Math.floor(left / 60000)}:${String(Math.floor((left % 60000) / 1000)).padStart(2, '0')} min`);
		await sleep(Math.min(60000, left));
	}
}

async function checkRateLimit() {
	const remaining = getRemainingRequests(rateLimit);
	if (remaining.daily <= DAILY_BUFFER) throw new DailyLimitReachedError();
	if (remaining.short <= SHORT_TERM_BUFFER) await waitForNextWindow('15-min-Limit fast erreicht');
}

type Query = Record<string, string | number | boolean | undefined>;

export async function stravaFetch<T>(pathname: string, query: Query = {}): Promise<T> {
	const url = new URL(`${API_URL}${pathname}`);
	for (const [key, value] of Object.entries(query)) if (value !== undefined) url.searchParams.set(key, String(value));

	let authRetried = false;
	let serverRetries = 0;
	let rateLimitRetries = 0;
	for (;;) {
		await checkRateLimit();
		const accessToken = await getAccessToken();
		let res: Response;
		try {
			res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
		} catch (err) {
			if (++serverRetries > MAX_SERVER_RETRIES) {
				throw new StravaApiError(`Netzwerkfehler bei GET ${pathname}: ${(err as Error).message}`, 0);
			}
			await sleep(2 ** serverRetries * 1000);
			continue;
		}
		updateRateLimit(res.headers);

		if (res.ok) return (await res.json()) as T;
		if (res.status === 404) throw new NotFoundError(pathname);
		if (res.status === 401) {
			if (authRetried) throw new StravaAuthError(`Zugriff verweigert (HTTP 401) bei GET ${pathname}.`);
			authRetried = true;
			await getAccessToken(true);
			continue;
		}
		if (res.status === 429) {
			if (getRemainingRequests(rateLimit).daily <= DAILY_BUFFER) throw new DailyLimitReachedError();
			if (++rateLimitRetries > MAX_RATE_LIMIT_RETRIES) throw new StravaApiError(`HTTP 429 bei GET ${pathname}`, 429);
			await waitForNextWindow('HTTP 429');
			continue;
		}
		if (res.status >= 500 && ++serverRetries <= MAX_SERVER_RETRIES) {
			await sleep(2 ** serverRetries * 1000);
			continue;
		}
		const message = await res
			.json()
			.then((body: { message?: string }) => body.message)
			.catch(() => undefined);
		throw new StravaApiError(
			`GET ${pathname} fehlgeschlagen: HTTP ${res.status}${message ? ` (${message})` : ''}`,
			res.status,
		);
	}
}

export async function* paginate<T>(pathname: string, query: Query = {}): AsyncGenerator<T> {
	for (let page = 1; ; page++) {
		const items = await stravaFetch<T[]>(pathname, { ...query, page, per_page: 200 });
		if (items.length === 0) return;
		yield* items;
	}
}

export function getActivity(id: number) {
	return stravaFetch<DetailedActivity>(`/activities/${id}`, { include_all_efforts: false });
}

/** after/before: epoch seconds */
export function listActivities({ after, before }: { after?: number; before?: number } = {}) {
	return paginate<SummaryActivity>('/athlete/activities', { after, before });
}

export function getAthlete() {
	return stravaFetch<DetailedAthlete>('/athlete');
}
