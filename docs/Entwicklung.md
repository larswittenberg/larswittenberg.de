# Entwicklung & Deployment

## Setup

```bash
nvm use            # Node-Version aus .nvmrc (24)
corepack enable    # Yarn 4 über Corepack
yarn install
yarn dev           # http://localhost:3000
```

## Befehle

| Befehl | Zweck |
| ------ | ----- |
| `yarn dev` | Dev-Server mit Hot Reload |
| `yarn build` / `yarn start` | Produktions-Build bzw. -Server |
| `yarn lint` | ESLint |
| `yarn typecheck` | TypeScript ohne Emit |
| `yarn format` | Prettier über `./src` |
| `yarn verify` | Lint, Typecheck, Format und Build in einem |
| `yarn update-stars` | GitHub-Stars aktualisieren → [Github-Stars](projekte/Github-Stars/README.md) |
| `yarn build:tweets` | Suchindex für das Twitter-Archiv erzeugen → [Twitter-Archiv](projekte/Twitter-Archiv/README.md) |
| `yarn blob:upload` | Twitter-Medien zu Vercel Blob hochladen → [Twitter-Media](projekte/Twitter-Archiv/Twitter-Media.md) |
| `yarn strava:*` | Strava-Import, -API und -Sync → [Strava-Dashboard](projekte/Strava-Dashboard/README.md) |

## Umgebungsvariablen

Lokal in `.env.local` (nicht eingecheckt), in Produktion auf Vercel unter **Settings → Environment Variables**, für GitHub Actions als Repository-Secrets.

Vorlage: `.env.local.example` kopieren und ausfüllen:

```bash
cp .env.local.example .env.local
```

### GitHub

| Variable | Wofür | Wo nötig |
| -------- | ----- | -------- |
| `GH_TOKEN` | Personal Access Token für die GitHub-API ([erstellen](https://github.com/settings/personal-access-tokens)), genutzt von `yarn update-stars` | lokal, Vercel, Actions |
| `GH_USERNAME` | GitHub-Benutzername, dessen Stars geladen bzw. angezeigt werden | lokal, Vercel, Actions |

### Vercel Blob

| Variable | Wofür | Wo nötig |
| -------- | ----- | -------- |
| `BLOB_READ_WRITE_TOKEN` | Schreibzugriff auf den Blob-Store, genutzt von `yarn blob:upload` (Twitter-Medien) | lokal |
| `BLOB_STORE_ID` | ID des Blob-Stores (Referenz, wird aktuell nicht vom Code gelesen) | optional |

Token und Store-ID stehen im Vercel-Projekt unter **Storage → Blob**.

### GitHub-Stars (Entwicklung)

| Variable | Wofür | Wo nötig |
| -------- | ----- | -------- |
| `NEXT_PUBLIC_ENABLE_GITHUB_DEBUG` | Debug-Ausgaben `[GitHub Debug]` (auch im Browser), Werte `true`/`1`/`yes`/`on`/`debug` | optional, lokal |
| `ENABLE_GITHUB_DEBUG` | wie oben, nur serverseitig | optional, lokal |
| `USE_FAKE_API` | Schalter für Mock-Daten statt Live-API; aktuell ohne Wirkung, die Datenquelle ist fest auf Mock gesetzt (`src/lib/projects/github-stars/dataClient.ts`) | optional |

### Strava

| Variable | Wofür | Wo nötig |
| -------- | ----- | -------- |
| `STRAVA_DASHBOARD_PASSWORD` | Passwort für den Login ins Strava-Dashboard (lang und zufällig) | lokal, Vercel |
| `STRAVA_SESSION_SECRET` | Signatur der Session-Cookies (min. 32 Zeichen) | lokal, Vercel |
| `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET` | Zugangsdaten der Strava-App für `strava:auth`, `strava:enrich`, `strava:sync` | lokal, (geplant) Actions |
| `STRAVA_REFRESH_TOKEN` | Refresh-Token als Fallback bzw. für CI ohne Token-Datei | optional, (geplant) Actions |
| `STRAVA_TOKEN_STORE` | `env` → Tokens nur aus der Env statt aus `data/strava-tokens.json` (automatisch bei `CI=true`) | optional |

Details zur Strava-API: [Strava-API](projekte/Strava-Dashboard/Strava-API.md).

## Deployment

- Hosting auf Vercel; jeder Push auf `main` löst ein Deployment aus.
- Vercel Analytics und Speed Insights sind eingebunden.
- GitHub Actions: `.github/workflows/update-data.yml` aktualisiert die GitHub-Stars (wöchentlich + manuell).

## Credits

- Social Media / Brand Icons: [simpleicons.org](https://simpleicons.org/)
- [Victory Emoji](https://emojipedia.org/victory-hand/)
- Mockup Images: [magicmockups.com](https://magicmockups.com/)
