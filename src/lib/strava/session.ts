import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/strava/auth';

export async function isAuthenticated() {
	return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}
