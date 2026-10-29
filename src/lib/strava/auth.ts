import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'strava_session';
export const SESSION_COOKIE_PATH = '/projekte/strava';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function getSecret(): string | null {
	const secret = process.env.STRAVA_SESSION_SECRET;
	return secret && secret.length >= 32 ? secret : null;
}

function sign(payload: string, secret: string) {
	return createHmac('sha256', secret).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string) {
	// Hash first so lengths match and comparison time doesn't depend on input length.
	return timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
}

export function isAuthConfigured() {
	return Boolean(process.env.STRAVA_DASHBOARD_PASSWORD) && getSecret() !== null;
}

export function checkPassword(input: string) {
	const password = process.env.STRAVA_DASHBOARD_PASSWORD;
	return Boolean(password) && safeEqual(input, password!);
}

export function createSessionToken(): string {
	const secret = getSecret();
	if (!secret) throw new Error('STRAVA_SESSION_SECRET is missing or shorter than 32 characters');
	const expiresAt = String(Date.now() + SESSION_MAX_AGE * 1000);
	return `${expiresAt}.${sign(expiresAt, secret)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
	const secret = getSecret();
	if (!token || !secret) return false;
	const [expiresAt, signature] = token.split('.');
	if (!expiresAt || !signature || !/^\d+$/.test(expiresAt) || Number(expiresAt) < Date.now()) return false;
	return safeEqual(signature, sign(expiresAt, secret));
}
