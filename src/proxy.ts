import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/strava/auth';

// Optimistic check for future protected sub-routes; pages must still verify the session themselves.
export function proxy(request: NextRequest) {
	if (!verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) {
		return NextResponse.redirect(new URL('/projekte/strava', request.url));
	}
	return NextResponse.next();
}

export const config = {
	matcher: '/projekte/strava/:path+',
};
