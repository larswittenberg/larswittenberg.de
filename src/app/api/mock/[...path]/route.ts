import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MOCK_ROOT = path.join(process.cwd(), 'src', 'mocks');
const NO_CACHE_HEADERS = {
	'Cache-Control': 'no-store, max-age=0, must-revalidate',
	Pragma: 'no-cache',
	Expires: '0',
} as const;

const isNotFoundError = (error: unknown): boolean => {
	if (!error || typeof error !== 'object') {
		return false;
	}

	return 'code' in error && (error as { code?: string | number }).code === 'ENOENT';
};

export async function GET(_: Request, context: { params: Promise<{ path: string[] }> }) {
	if (process.env.NODE_ENV === 'production') {
		return NextResponse.json(
			{ error: 'Mock-Routen sind in der Produktion deaktiviert.' },
			{ status: 404, headers: NO_CACHE_HEADERS },
		);
	}

	const params = await context.params;
	const segments = Array.isArray(params.path) ? params.path : [];
	if (segments.length === 0) {
		return NextResponse.json(
			{ error: 'Pfadsegment für Mock-Datei fehlt.' },
			{ status: 400, headers: NO_CACHE_HEADERS },
		);
	}

	const relativePath = path.join(...segments);
	const sanitizedPath = path.normalize(relativePath);

	if (sanitizedPath.startsWith('..') || path.isAbsolute(sanitizedPath)) {
		return NextResponse.json({ error: 'Ungültiger Mock-Pfad.' }, { status: 400, headers: NO_CACHE_HEADERS });
	}

	const filePath = path.join(MOCK_ROOT, `${sanitizedPath}.json`);
	try {
		const fileContent = await fs.readFile(filePath, 'utf8');
		const parsed = JSON.parse(fileContent) as unknown;
		return NextResponse.json(parsed, {
			status: 200,
			headers: NO_CACHE_HEADERS,
		});
	} catch (error) {
		if (isNotFoundError(error)) {
			return NextResponse.json(
				{
					error: `Keine Mock-Datei unter ${path.relative(process.cwd(), filePath)} gefunden.`,
				},
				{ status: 404, headers: NO_CACHE_HEADERS },
			);
		}

		return NextResponse.json(
			{
				error:
					error instanceof Error
						? `Fehler beim Lesen der Mock-Datei: ${error.message}`
						: 'Unerwarteter Fehler beim Laden der Mock-Daten.',
			},
			{ status: 500, headers: NO_CACHE_HEADERS },
		);
	}
}
