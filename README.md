# larswittenberg.de - Next.js & TailwindCSS

My personal website built with Next.js & TailwindCSS

## Credits

- Social Media / Brand Icons: [https://simpleicons.org/](https://simpleicons.org/)
- [Victory Emoji](https://emojipedia.org/victory-hand/)
- Mockup Images [https://magicmockups.com/](https://magicmockups.com/)

## Projekte - Github-Stars

- `.env.local` anlegen und einen **GitHub Personal Access Token (PAT)** sowie deinen Benutzernamen hinterlegen:

```env
GH_TOKEN=<dein-token>
GH_USERNAME=<dein-github-benutzername>
```

Der Token benötigt mindestens Leserechte für Sternlisten (z. B. Scope `read:user` oder `public_repo`).

- Daten abrufen: `yarn update-stars` ausführen. Dieser Befehl lädt alle deine Sterne von der GitHub-API und speichert sie in `src/data/starred-repositories.json`. **Diese Datei muss eingecheckt werden.**
- Entwicklung: `yarn dev` starten und `http://localhost:3000` öffnen.

> **Wichtig für Deployments (z. B. Vercel):** Hinterlege dieselben Variablen im Projekt unter **Settings → Environment Variables**.
> Ohne gültigen `GH_TOKEN` kann das `update-stars`-Skript nicht auf die GitHub-API zugreifen.

### Aktualisierung der GitHub-Tokens

Hier [Actions secrets and variables](https://github.com/larswittenberg/test-codex-github-stars/settings/secrets/actions) den `GH_TOKEN` aktualisieren, um den Workflow `Update Starred Repositories` auszuführen, wenn hier [Regenerate fine-grained personal access token](https://github.com/settings/personal-access-tokens/9370273/regenerate) der Token erneuert wird.

### GitHub-Token für Produktionsdeployments

1. Erstelle im GitHub-Account einen Personal Access Token (klassisch) mit mindestens dem Scope `public_repo` (Leserechte).
2. Öffne z. B. auf Vercel dein Projekt → **Settings → Environment Variables** und hinterlege:

   |Key            |Value                                   |
   |-------------- |--------------------------------------- |
   |`GH_TOKEN`     |dein Personal Access Token              |
   |`GH_USERNAME`  |(optional) GitHub-Account, dessen Stars geladen werden |

3. Trigger anschließend ein Re-Deployment. Ohne diese Variablen schlägt der Server mit `403 Forbidden` fehl und die Oberfläche zeigt den GitHub API-Fehler an.

> Tipp: Bewahre den Token sicher auf; in Pull Requests oder Logs darf er nicht auftauchen. Wechsle ihn bei Bedarf aus und triggere anschließend erneut ein Deployment.

## Twitter-Media (Vercel Blob)

Um das Vercel Deployment-Speicherlimit (10 GB) einzuhalten, werden Mediendateien (Bilder & MP4-Videos) des Twitter-Archivs in einen **Vercel Blob Store (Public)** ausgelagert statt im Git-Repository gebündelt.

### Vorbereitung

In der `.env.local` muss der Lese-/Schreib-Token für den Vercel Blob Store hinterlegt sein:

```env
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

### Upload-Skript ausführen

Das Skript `scripts/upload-to-blob.mjs` lädt Dateien aus `public/projekte/twitter-media/` zu Vercel Blob hoch. Bereits vorhandene Blobs werden automatisch erkannt und übersprungen:

```bash
# Gesamten Ordner hochladen
yarn blob:upload

# Testlauf mit begrenzter Anzahl an Dateien (z. B. 5)
yarn blob:upload --limit 5

# Mit benutzerdefinierter Anzahl paralleler Uploads (Standard: 3)
yarn blob:upload --concurrency 5

# Vorhandene Blobs erzwingend überschreiben
yarn blob:upload --force
```

## Projekte - Strava Dashboard

Dashboard unter `/projekte/strava` mit allen Strava-Aktivitäten (Filter nach Jahr und Typ, Sortierung, Summen, Direktlink zu Strava). Datenbasis ist eine lokale SQLite-Datenbank, die aus einem Strava-Datenexport erzeugt wird.

### Datenfluss

1. Strava-Export herunterladen (Strava → Einstellungen → Mein Konto → „Konto herunterladen“) und entpacken nach `data/strava-export/`.
2. `yarn strava:import` liest `data/strava-export/activities.csv` und schreibt die Aktivitäten in `src/data/strava.db`.
3. `src/data/strava.db` wird committet und mit ausgeliefert. Die Seite wird pro Request gerendert (wegen des Login-Cookies) und liest die DB read-only per `better-sqlite3`.

> **Wichtig:** `data/strava-export/` ist in der `.gitignore` und darf nicht eingecheckt werden (enthält GPS-Dateien, Nachrichten, Logins etc.). `src/data/strava.db` dagegen **muss** eingecheckt werden – das Repo ist privat.

### Import-Skript

```bash
# Testlauf mit 20 Aktivitäten, schreibt nichts
yarn strava:import --dry-run --limit 20

# Testlauf über alle Aktivitäten
yarn strava:import --dry-run

# Import (vorhandene Einträge werden aktualisiert)
yarn strava:import

# Nur Aktivitäten importieren, deren ID noch nicht in der DB ist
yarn strava:import --only-new
```

| Option | Beschreibung |
| ------ | ------------ |
| `--dry-run` | Parst und validiert nur, zeigt Statistik und eine Beispieltabelle. Schreibt nichts, Exit-Code 1 bei ungültigen Zeilen. |
| `--limit N` | Nur die ersten N Zeilen der CSV verarbeiten. |
| `--only-new` | Bereits vorhandene IDs überspringen (statt Upsert). |
| `--export-dir PATH` | Export-Ordner (Standard: `data/strava-export`). |
| `--db PATH` | Datenbankdatei (Standard: `src/data/strava.db`). |

Der Import läuft in einer Transaktion (alles oder nichts) und nutzt `ON CONFLICT(id) DO UPDATE`, kann also beliebig oft wiederholt werden.

### Aktualisierung (z. B. alle paar Monate)

1. Neuen Strava-Export nach `data/strava-export/` entpacken (alten Inhalt ersetzen).
2. `yarn strava:import --dry-run --only-new` – zeigt, wie viele Aktivitäten neu sind.
3. `yarn strava:import --only-new`
4. `src/data/strava.db` committen und pushen → Vercel deployt die neue DB.

### Datenmodell

- Typen: `src/types/strava.ts`, Schema: `src/lib/strava/schema.ts`
- Tabelle `activities`, Primärschlüssel ist die Strava-Aktivitäts-ID.
- Einheiten wie in der Strava-API: Distanz/Höhe in Metern, Zeiten in Sekunden, Geschwindigkeiten in m/s, `start_date` als ISO-String (UTC).
- Spaltennamen folgen der Strava-API (`sport_type`, `moving_time`, `total_elevation_gain` …); die Spalte `source` (`export` | `api`) ist für eine spätere API-Anbindung vorbereitet.
- Zusätzliche Metriken (Höhe, Steigung, Trittfrequenz, Leistung, Belastung, Wetter, Laufwerte, Gewicht) sind zentral in `ACTIVITY_METRIC_COLUMNS` (`src/lib/strava/schema.ts`) definiert. Fehlende Spalten ergänzt das Import-Skript automatisch per `ALTER TABLE` – neue Felder also dort und in `METRIC_SOURCES` (`scripts/import-strava.ts`) eintragen und `yarn strava:import` erneut ausführen.
- Nicht übernommen: private Notizen, GPS-/FIT-Dateien sowie im Export immer leere Spalten (`Max Watts`, `Max Temperature`, `Newly Explored Distance`).

### Relevante Dateien

| Datei | Zweck |
| ----- | ----- |
| `scripts/import-strava.ts` | CSV-Import (ausgeführt mit `tsx`) |
| `src/lib/strava/db.ts` | Read-only Zugriff auf die DB |
| `src/app/projekte/strava/page.tsx` | Server Component / Seite (öffentliche Summen, Login oder Dashboard) |
| `src/app/projekte/strava/actions.ts` | Server Actions für Login/Logout inkl. Honeypot und Rate-Limit |
| `src/lib/strava/auth.ts` | Passwortprüfung und signiertes Session-Token |
| `src/lib/strava/session.ts` | `isAuthenticated()` für Server Components |
| `src/proxy.ts` | Leitet künftige Unterseiten `/projekte/strava/*` ohne Session auf die Login-Seite um |
| `src/components/projects/strava/strava-dashboard.tsx` | Client-UI mit Filtern und Tabelle |
| `src/components/projects/strava/strava-totals-overview.tsx` | Öffentliche Gesamtsummen |
| `src/components/projects/strava/strava-login-form.tsx` | Login-Formular |
| `next.config.js` | `outputFileTracingIncludes` liefert die DB mit der Serverless-Funktion aus |

### Passwortschutz

Öffentlich sichtbar sind nur die vier Gesamtsummen (Aktivitäten, Distanz, Höhenmeter, Bewegungszeit). Liste, Filter, Details und gefilterte Summen erscheinen erst nach Login; ohne gültige Session werden diese Daten serverseitig gar nicht geladen (`getDashboardData()` prüft die Session selbst).

Nach dem Login lädt der Server nur die Aktivitäten des aktuellen Jahres. Andere Jahre werden per URL-Parameter nachgeladen (`?year=2024`, `?year=all` für alle Jahre); Typ und Sortierung (`?type=Ride&sort=distance-desc`) werden clientseitig angewendet.

Benötigte Variablen in `.env.local` und auf Vercel (**Settings → Environment Variables**):

```env
# Langes Zufallspasswort, z. B. `openssl rand -base64 24`
STRAVA_DASHBOARD_PASSWORD="..."
# Mindestens 32 Zeichen, z. B. `openssl rand -base64 48`
STRAVA_SESSION_SECRET="..."
```

- Session-Cookie `strava_session`: `httpOnly`, `secure` (Produktion), `sameSite=lax`, Pfad `/projekte/strava`, 30 Tage gültig, HMAC-signiert.
- Alle Sessions ungültig machen: `STRAVA_SESSION_SECRET` ändern und neu deployen.
- Schutz gegen Brute-Force: Honeypot-Feld, 1 s Verzögerung bei Fehlversuchen, max. 5 Fehlversuche pro IP in 15 Minuten (pro Server-Instanz, daher nur Zusatzschutz), zeitkonstanter Passwortvergleich. Der eigentliche Schutz ist ein langes Zufallspasswort.
- Fehlen die Variablen, schlägt jeder Login fehl (Fehler im Server-Log), die öffentlichen Summen bleiben sichtbar.

> **Hinweis:** Die Seite ist zusätzlich nicht verlinkt, nicht in der Sitemap und `noindex`.
