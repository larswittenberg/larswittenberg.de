/**
 * One-time Strava OAuth flow; stores the tokens in data/strava-tokens.json.
 *
 * Usage:
 *   yarn strava:auth [--port 8723] [--open]
 */
import crypto from 'node:crypto';
import http from 'node:http';
import { execFile } from 'node:child_process';
import { parseArgs } from 'node:util';
import {
	FileTokenStore,
	OAUTH_URL,
	REQUIRED_SCOPE,
	TOKEN_FILE,
	getClientCredentials,
	loadEnv,
	requestToken,
} from './lib/strava-api/client';
import { errorMessage, fail, parsePositiveInt } from './lib/strava-api/cli';

const TIMEOUT_MS = 5 * 60 * 1000;

const { values: args } = parseArgs({
	options: {
		port: { type: 'string', default: '8723' },
		open: { type: 'boolean', default: false },
	},
});

const port = parsePositiveInt('--port', args.port)!;
loadEnv();

let clientId: string;
try {
	({ clientId } = getClientCredentials());
} catch (err) {
	fail(errorMessage(err));
}

const state = crypto.randomBytes(16).toString('hex');
const redirectUri = `http://localhost:${port}/callback`;
const authorizeUrl = new URL(`${OAUTH_URL}/authorize`);
authorizeUrl.search = new URLSearchParams({
	client_id: clientId,
	response_type: 'code',
	redirect_uri: redirectUri,
	approval_prompt: 'force',
	scope: `read,${REQUIRED_SCOPE}`,
	state,
}).toString();

const sameState = (received: string) =>
	received.length === state.length && crypto.timingSafeEqual(Buffer.from(received), Buffer.from(state));

async function handleCallback(url: URL) {
	const error = url.searchParams.get('error');
	if (error) throw new Error(`Autorisierung abgelehnt (${error}).`);
	if (!sameState(url.searchParams.get('state') ?? '')) throw new Error('Ungültiger state-Parameter – Abbruch.');

	const scopes = (url.searchParams.get('scope') ?? '').split(',');
	if (!scopes.includes(REQUIRED_SCOPE)) {
		throw new Error(`Scope "${REQUIRED_SCOPE}" wurde nicht gewährt – beim Autorisieren alle Berechtigungen erlauben und erneut ausführen.`);
	}
	const code = url.searchParams.get('code');
	if (!code) throw new Error('Kein Autorisierungscode erhalten.');

	const token = await requestToken({ grant_type: 'authorization_code', code });
	const tokens = {
		access_token: token.access_token,
		refresh_token: token.refresh_token,
		expires_at: token.expires_at,
		athlete_id: token.athlete?.id ?? null,
		scope: scopes.join(','),
	};
	new FileTokenStore().save(tokens);
	return tokens;
}

const server = http.createServer((req, res) => {
	const url = new URL(req.url ?? '/', redirectUri);
	const respond = (statusCode: number, message: string, exitCode?: number) => {
		res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
		res.end(`<!doctype html><meta charset="utf-8"><title>Strava-Auth</title><p>${message}</p>`, () => {
			if (exitCode === undefined) return;
			server.close();
			process.exit(exitCode);
		});
	};

	if (url.pathname !== '/callback') return respond(404, 'Nicht gefunden.');

	handleCallback(url)
		.then((tokens) => {
			console.log(`Tokens gespeichert in ${TOKEN_FILE} (Athlet ${tokens.athlete_id ?? '?'}, Scope ${tokens.scope}).`);
			console.log(`Access-Token gültig bis ${new Date(tokens.expires_at * 1000).toLocaleString('de-DE')}; Refresh erfolgt automatisch.`);
			respond(200, 'Strava ist verbunden. Dieses Fenster kann geschlossen werden.', 0);
		})
		.catch((err) => {
			console.error(errorMessage(err));
			respond(400, 'Autorisierung fehlgeschlagen – Details im Terminal.', 1);
		});
});

server.on('error', (err) => fail(`Server konnte nicht gestartet werden: ${errorMessage(err)} (anderen Port mit --port wählen)`));

server.listen(port, '127.0.0.1', () => {
	console.log('Strava-Autorisierung im Browser öffnen:\n');
	console.log(`  ${authorizeUrl}\n`);
	console.log(`Warte auf Callback unter ${redirectUri} …`);
	if (args.open) {
		execFile(process.platform === 'darwin' ? 'open' : 'xdg-open', [authorizeUrl.toString()], (err) => {
			if (err) console.warn('Browser konnte nicht geöffnet werden – URL bitte manuell öffnen.');
		});
	}
});

setTimeout(() => fail('Zeitüberschreitung: kein Callback innerhalb von 5 Minuten.'), TIMEOUT_MS).unref();
