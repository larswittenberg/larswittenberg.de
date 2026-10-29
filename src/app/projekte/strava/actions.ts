'use server';

import { cookies, headers } from 'next/headers';
import { refresh } from 'next/cache';
import {
	SESSION_COOKIE,
	SESSION_COOKIE_PATH,
	SESSION_MAX_AGE,
	checkPassword,
	createSessionToken,
	isAuthConfigured,
} from '@/lib/strava/auth';

export type LoginState = { error: string | null };

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const FAILURE_DELAY_MS = 1000;

// Best effort only: state is per server instance and resets on cold start.
const failedAttempts = new Map<string, { count: number; resetAt: number }>();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getClientIp() {
	const h = await headers();
	return h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

function isRateLimited(ip: string) {
	const entry = failedAttempts.get(ip);
	if (!entry || entry.resetAt < Date.now()) return false;
	return entry.count >= MAX_FAILED_ATTEMPTS;
}

function registerFailure(ip: string) {
	const now = Date.now();
	const entry = failedAttempts.get(ip);
	if (!entry || entry.resetAt < now) failedAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
	else entry.count += 1;
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
	const ip = await getClientIp();

	if (isRateLimited(ip)) {
		return { error: 'Zu viele Fehlversuche. Bitte in 15 Minuten erneut versuchen.' };
	}

	const password = formData.get('password');
	const honeypot = formData.get('website');

	if (!isAuthConfigured()) {
		console.error('Strava login: STRAVA_DASHBOARD_PASSWORD or STRAVA_SESSION_SECRET not configured');
	}

	const valid =
		isAuthConfigured() &&
		!honeypot &&
		typeof password === 'string' &&
		password.length > 0 &&
		password.length <= 256 &&
		checkPassword(password);

	if (!valid) {
		registerFailure(ip);
		await delay(FAILURE_DELAY_MS);
		return { error: 'Anmeldung fehlgeschlagen.' };
	}

	failedAttempts.delete(ip);
	(await cookies()).set(SESSION_COOKIE, createSessionToken(), {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: SESSION_COOKIE_PATH,
		maxAge: SESSION_MAX_AGE,
	});
	refresh();
	return { error: null };
}

export async function logout() {
	(await cookies()).delete({ name: SESSION_COOKIE, path: SESSION_COOKIE_PATH });
	refresh();
}
