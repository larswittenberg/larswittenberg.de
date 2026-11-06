# Projekte – GitHub-Stars

Seite `/projekte/github-stars` mit allen GitHub-Repositories, die ich mit einem Stern markiert habe (Suche, Filter). Datenbasis ist `src/data/starred-repositories.json`.

## Setup

In `.env.local` einen **GitHub Personal Access Token (PAT)** und den Benutzernamen hinterlegen:

```env
GH_TOKEN=<dein-token>
GH_USERNAME=<dein-github-benutzername>
```

Der Token benötigt mindestens Leserechte für Sternlisten (z. B. Scope `read:user` oder `public_repo`).

## Daten aktualisieren

- Lokal: `yarn update-stars` lädt alle Sterne über die GitHub-API und speichert sie in `src/data/starred-repositories.json`. **Diese Datei muss eingecheckt werden.**
- Automatisch: Workflow `.github/workflows/update-data.yml` („Update Starred Repositories Data“) läuft sonntags um 03:00 Uhr und lässt sich manuell auf der Actions-Seite starten. Er committet die JSON-Datei nur, wenn sich etwas geändert hat.

## Token erneuern

Wenn der Token abläuft:

1. Token neu erzeugen: [Regenerate fine-grained personal access token](https://github.com/settings/personal-access-tokens/9370273/regenerate).
2. In den [Actions secrets and variables](https://github.com/larswittenberg/test-codex-github-stars/settings/secrets/actions) das Secret `GH_TOKEN` aktualisieren, damit der Workflow weiterläuft.
3. Ggf. auch in `.env.local` und auf Vercel austauschen und neu deployen.

## Token für Produktionsdeployments

1. Im GitHub-Account einen Personal Access Token (klassisch) mit mindestens dem Scope `public_repo` (Leserechte) erstellen.
2. Auf Vercel im Projekt unter **Settings → Environment Variables** hinterlegen:

   | Key | Value |
   | --- | ----- |
   | `GH_TOKEN` | Personal Access Token |
   | `GH_USERNAME` | (optional) GitHub-Account, dessen Stars geladen werden |

3. Re-Deployment auslösen. Ohne diese Variablen schlägt der Server mit `403 Forbidden` fehl und die Oberfläche zeigt den GitHub-API-Fehler an.

> Den Token sicher aufbewahren; in Pull Requests oder Logs darf er nicht auftauchen.

## Relevante Dateien

| Datei | Zweck |
| ----- | ----- |
| `src/scripts/fetch-starred-repos.js` | Skript hinter `yarn update-stars` |
| `src/data/starred-repositories.json` | Datenbasis (eingecheckt) |
| `src/mocks/github/starred-repositories.json` | Mock-Daten |
| `src/app/projekte/github-stars/page.tsx` | Seite |
| `src/app/api/projects/github-stars/` | API-Route |
| `src/components/projects/github-stars/` | UI-Komponenten |
| `src/lib/projects/github-stars/` | Logik (Laden, Filtern) |
| `.github/workflows/update-data.yml` | Automatische Aktualisierung |
