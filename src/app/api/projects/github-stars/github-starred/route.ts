import { NextResponse } from 'next/server';
import { getStarredRepositories } from '@/lib/projects/github-stars/dataClient';
import { GitHubApiError } from '@/lib/projects/github-stars/github';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const NO_CACHE_HEADERS = {
	'Cache-Control': 'no-store, max-age=0, must-revalidate',
	Pragma: 'no-cache',
	Expires: '0',
} as const;

export async function GET() {
	try {
		const data = await getStarredRepositories();
		return NextResponse.json(data, { headers: NO_CACHE_HEADERS });
	} catch (error) {
		if (error instanceof GitHubApiError) {
			return NextResponse.json(
				{
					error: error.message,
					status: error.status,
				},
				{
					status: error.status,
					headers: NO_CACHE_HEADERS,
				},
			);
		}

		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : 'Unexpected error while fetching starred repositories.',
			},
			{
				status: 500,
				headers: NO_CACHE_HEADERS,
			},
		);
	}
}
