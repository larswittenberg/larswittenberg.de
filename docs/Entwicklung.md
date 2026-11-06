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

| Variable | Wofür | Wo nötig |
| -------- | ----- | -------- |
| `GH_TOKEN`, `GH_USERNAME` | GitHub-Stars | lokal, Vercel, Actions |
| `BLOB_READ_WRITE_TOKEN` | Upload der Twitter-Medien | lokal |
| `STRAVA_DASHBOARD_PASSWORD`, `STRAVA_SESSION_SECRET` | Login Strava-Dashboard | lokal, Vercel |
| `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET` | Strava-API-Skripte | lokal, (geplant) Actions |
| `STRAVA_REFRESH_TOKEN`, `STRAVA_TOKEN_STORE` | Strava-API ohne Token-Datei (CI) | optional |

## Deployment

- Hosting auf Vercel; jeder Push auf `main` löst ein Deployment aus.
- Vercel Analytics und Speed Insights sind eingebunden.
- GitHub Actions: `.github/workflows/update-data.yml` aktualisiert die GitHub-Stars (wöchentlich + manuell).

## Credits

- Social Media / Brand Icons: [simpleicons.org](https://simpleicons.org/)
- [Victory Emoji](https://emojipedia.org/victory-hand/)
- Mockup Images: [magicmockups.com](https://magicmockups.com/)
