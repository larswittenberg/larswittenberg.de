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

Dashboard unter `/projekte/strava` mit allen Strava-Aktivitäten (Filter nach Jahr, Typ, Ausrüstung, Gerät und Tag, Sortierung, Summen, Direktlink zu Strava). Datenbasis ist eine lokale SQLite-Datenbank, die aus einem Strava-Datenexport erzeugt und über die Strava-API ergänzt wird.

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
| `--only-new` | Bereits per Export importierte IDs überspringen (statt Upsert). Per `strava:sync` angelegte Zeilen (`source = 'api'`) werden durch die Export-Daten ersetzt. |
| `--export-dir PATH` | Export-Ordner (Standard: `data/strava-export`). |
| `--db PATH` | Datenbankdatei (Standard: `src/data/strava.db`). |

Der Import läuft in einer Transaktion (alles oder nichts) und nutzt `ON CONFLICT(id) DO UPDATE`, kann also beliebig oft wiederholt werden. Die API-Spalten (`device_name`, `workout_type`, `trainer` …) schreibt der Import nie – sie bleiben bei einem erneuten Import erhalten.

**Sprache des Exports:** Strava exportiert die CSV in der Sprache des Kontos. Das Skript erkennt englische und deutsche Exporte automatisch (`export language: de` in der Ausgabe). Deutsche Spaltennamen werden über `HEADER_DE`, deutsche Aktivitätsarten (z. B. `Radfahrt` → `Ride`) über `ACTIVITY_TYPE_DE` in `scripts/import-strava.ts` auf die englischen Werte abgebildet, damit Filter und Charts weiter funktionieren. Taucht eine neue deutsche Aktivitätsart auf, meldet der Dry-Run sie als Fehler – dann dort ergänzen.

### Aktualisierung (z. B. alle paar Monate)

1. Neuen Strava-Export nach `data/strava-export/` entpacken (alten Inhalt ersetzen).
2. `yarn strava:import --dry-run --only-new` – zeigt, wie viele Aktivitäten neu sind.
3. `yarn strava:import --only-new`
4. `src/data/strava.db` committen und pushen → Vercel deployt die neue DB.

### Strava-API (Enrichment und Sync)

Drei Skripte ergänzen den Export über die Strava-API v3 (gemeinsamer Client in `scripts/lib/strava-api/`):

| Befehl | Zweck |
| ------ | ----- |
| `yarn strava:auth` | Einmaliger OAuth-Flow, speichert Tokens in `data/strava-tokens.json` |
| `yarn strava:enrich` | Ergänzt **bestehende** Aktivitäten um Gerät, `workout_type` (Wettkampf, Langer Lauf, Training …), Indoor/Rolle, Sichtbarkeit u. a. |
| `yarn strava:sync` | Holt **neue** Aktivitäten aus Strava (`source = 'api'`) |

#### Einrichtung (einmalig)

1. Unter https://www.strava.com/settings/api eine App anlegen, **Authorization Callback Domain:** `localhost`.
2. In `.env.local` eintragen:

    ```env
    STRAVA_CLIENT_ID=12345
    STRAVA_CLIENT_SECRET="..."
    ```

3. `yarn strava:auth` ausführen (optional `--open` öffnet den Browser, `--port` ändert den Port 8723) und die angezeigte URL öffnen. Alle Berechtigungen erlauben – `activity:read_all` ist nötig, damit auch private Aktivitäten geliefert werden.
4. Die Tokens landen in `data/strava-tokens.json` (Dateirechte `0600`, in der `.gitignore`, **nie committen**). Der Access-Token wird automatisch erneuert, ein neuer Refresh-Token wird jeweils gespeichert.

Fehlt die Token-Datei, aber `STRAVA_REFRESH_TOKEN` ist gesetzt, wird damit refresht und die Datei angelegt. Mit `STRAVA_TOKEN_STORE=env` (bzw. automatisch bei `CI=true`) wird keine Datei gelesen/geschrieben, sondern nur `STRAVA_REFRESH_TOKEN` genutzt.

#### Empfohlener Ablauf

1. Export herunterladen → `yarn strava:import` → `yarn strava:enrich` (ggf. über mehrere Tage, bis alles angereichert ist).
2. Laufend: `git pull`, dann `yarn strava:sync` und `src/data/strava.db` committen. Beim nächsten Export ersetzt `yarn strava:import --only-new` die API-Zeilen durch die Export-Daten (mehr Metriken, z. B. Wetter); die API-Spalten bleiben erhalten.

#### Rate-Limits

Strava erlaubt standardmäßig ca. 100 Read-Requests je 15 Minuten und 1000 pro Tag (Werte werden aus den Response-Headern gelesen). `strava:enrich` braucht einen Request pro Aktivität – bei ~2000 Aktivitäten dauert der erste Komplettlauf also ca. 2 Tage. Das Skript wartet am 15-min-Limit automatisch auf das nächste Fenster (`--no-wait` beendet stattdessen), stoppt am Tageslimit sauber (Exit-Code 0) und setzt beim nächsten Start fort. Jede Aktivität wird sofort gespeichert, Abbruch mit Ctrl+C ist jederzeit möglich.

```bash
# Testlauf: 5 Aktivitäten abrufen, nichts schreiben
yarn strava:enrich --dry-run --limit 5

# Alle noch nicht angereicherten Aktivitäten (neueste zuerst)
yarn strava:enrich

# Neue Aktivitäten seit der letzten in der DB (minus 3 Tage Überlappung)
yarn strava:sync --dry-run
yarn strava:sync
```

| Option (`strava:enrich`) | Beschreibung |
| ------ | ------------ |
| `--dry-run` | Ruft die API ab, schreibt nichts, zeigt eine Tabelle mit Gerät/Tags. |
| `--limit N` | Höchstens N Aktivitäten. |
| `--ids 123,456` | Nur diese Aktivitäten (unabhängig vom Status). |
| `--since` / `--until YYYY-MM-DD` | Zeitraum eingrenzen. |
| `--force` | Auch bereits angereicherte Aktivitäten erneut abrufen. |
| `--retry-not-found` | Als `not_found` markierte Aktivitäten erneut versuchen. |
| `--fill-gaps` | Zusätzlich leere Export-Spalten (z. B. `calories`, `average_temp`) befüllen, nie vorhandene Werte überschreiben. |
| `--no-wait` | Am 15-min-Limit beenden statt warten. |
| `--db PATH` | Datenbankdatei. |

| Option (`strava:sync`) | Beschreibung |
| ------ | ------------ |
| `--dry-run` | Listet neue Aktivitäten (nur Summary-Requests), schreibt nichts. |
| `--overlap-days N` | Überlappung zur neuesten Aktivität in der DB (Standard: 3). |
| `--since YYYY-MM-DD` / `--days N` | Alternativer Startzeitpunkt. |
| `--limit N` | Höchstens N neue Aktivitäten. |
| `--update-existing` | Vorhandene Aktivitäten im Zeitraum aktualisieren (`name`, `sport_type`, `description`, `commute`, `gear_name`). |
| `--no-details` | Nur Summary-Daten speichern (spart Requests; Gerät/Beschreibung/Kalorien holt später `strava:enrich`). |
| `--no-wait` | Am 15-min-Limit beenden statt warten (in CI Standard). |
| `--db PATH` | Datenbankdatei. |

Nicht über die API verfügbar und daher bei API-Zeilen leer bis zum nächsten Export: Wetter, Höhenverlust, Steigung, max. Trittfrequenz, Training Load, Intensität, GAP, Schritte, Schotter-Distanz, Gewichte, Dateiname (siehe `API_UNAVAILABLE_COLUMNS` in `scripts/lib/strava-api/map-activity.ts`).

### Strava-Sync per GitHub Action (geplant)

Der Workflow ist noch nicht angelegt; `strava:sync` ist aber bereits CI-tauglich: nicht interaktiv, kein Warten auf das 15-min-Fenster bei `CI=true`, Exit-Code `0` auch bei „nichts Neues“ und Tageslimit, `1` bei Fehlern. Ist `GITHUB_STEP_SUMMARY` gesetzt, wird eine Tabelle (ohne Aktivitätsnamen) angehängt; in `GITHUB_OUTPUT` stehen `new_count`, `changed` und `refresh_token_rotated`.

Benötigte Secrets: `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REFRESH_TOKEN` (Wert `refresh_token` aus `data/strava-tokens.json`).

**Refresh-Token-Rotation:** Strava kann beim Refresh einen neuen Refresh-Token ausgeben; der alte wird dann irgendwann ungültig. Das Skript erkennt das (Warnung ohne Token-Wert, Output `refresh_token_rotated=true`) und schreibt den neuen Token in die Datei aus `STRAVA_ROTATED_TOKEN_FILE`, falls gesetzt.

- **(a) Empfohlen:** Der Workflow aktualisiert das Secret per `gh secret set STRAVA_REFRESH_TOKEN < datei` (Wert nur über stdin, nie loggen). Benötigt einen Token mit Schreibrecht auf Repository-Secrets (z. B. Fine-grained PAT mit „Secrets: Read and write“ als Secret `GH_SECRETS_TOKEN`).
- **(b)** Der Job schlägt mit klarer Meldung fehl und das Secret wird manuell erneuert (`yarn strava:auth` lokal, Wert aus `data/strava-tokens.json` eintragen).

Skizze für `.github/workflows/strava-sync.yml`:

```yaml
name: Strava Sync

on:
  schedule:
    - cron: '0 4 * * *'
  workflow_dispatch:

permissions:
  contents: write

concurrency: strava-sync

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: corepack enable
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'yarn'
      - run: yarn install --immutable
      - name: Strava-Aktivitäten synchronisieren
        id: sync
        run: yarn strava:sync
        env:
          STRAVA_CLIENT_ID: ${{ secrets.STRAVA_CLIENT_ID }}
          STRAVA_CLIENT_SECRET: ${{ secrets.STRAVA_CLIENT_SECRET }}
          STRAVA_REFRESH_TOKEN: ${{ secrets.STRAVA_REFRESH_TOKEN }}
          STRAVA_ROTATED_TOKEN_FILE: ${{ runner.temp }}/strava-refresh-token
      # always(): also persist a rotated token if the sync step failed afterwards.
      - name: Refresh-Token-Secret aktualisieren
        if: always()
        run: |
          if [ -s "$RUNNER_TEMP/strava-refresh-token" ]; then
            gh secret set STRAVA_REFRESH_TOKEN < "$RUNNER_TEMP/strava-refresh-token"
          fi
        env:
          GH_TOKEN: ${{ secrets.GH_SECRETS_TOKEN }}
      - name: Änderungen committen und pushen
        if: steps.sync.outputs.changed == 'true'
        run: |
          git config --global user.name 'github-actions[bot]'
          git config --global user.email 'github-actions[bot]@users.noreply.github.com'
          git add src/data/strava.db
          if ! git diff --staged --quiet; then
            git commit -m "chore: update strava activities"
            git push
          fi
```

Der Push löst das Vercel-Deployment aus. `concurrency: strava-sync` verhindert, dass sich manueller und geplanter Lauf überschneiden. Lokal vor einem eigenen `strava:sync` immer erst `git pull`, um Merge-Konflikte in der Binärdatei `strava.db` zu vermeiden. `strava:enrich` bleibt bewusst manuell/lokal (hoher Request-Bedarf).

### Datenmodell

- Typen: `src/types/strava.ts`, Schema: `src/lib/strava/schema.ts`
- Tabelle `activities`, Primärschlüssel ist die Strava-Aktivitäts-ID.
- Einheiten wie in der Strava-API: Distanz/Höhe in Metern, Zeiten in Sekunden, Geschwindigkeiten in m/s, `start_date` als ISO-String (UTC).
- Spaltennamen folgen der Strava-API (`sport_type`, `moving_time`, `total_elevation_gain` …); die Spalte `source` (`export` | `api`) zeigt, ob eine Zeile aus dem Export oder aus `strava:sync` stammt.
- API-Spalten (`api_sport_type`, `device_name`, `workout_type`, `trainer`, `visibility`, `external_id`, `gear_id`, `start_date_local`, `timezone`, `api_synced_at`, `api_status`) stehen in `ACTIVITY_API_COLUMNS` und werden nur von `strava:enrich`/`strava:sync` geschrieben. Tags (Wettkampf, Langer Lauf, Training, Indoor, Pendeln) leitet `src/lib/strava/activity-tags.ts` daraus ab.
- `sport_type` enthält immer den Export-Namen (z. B. `Ride`), damit Filter und Charts für Export- und API-Zeilen gleich funktionieren. Die feinere Strava-Sportart (z. B. `GravelRide`, `MountainBikeRide`, `TrailRun`), die der Export nicht enthält, steht in `api_sport_type` und erscheint im Dashboard als eigene Option im Typ-Filter (`?type=strava:GravelRide`) sowie in den Details.
- Zusätzliche Metriken (Höhe, Steigung, Trittfrequenz, Leistung, Belastung, Wetter, Laufwerte, Gewicht) sind zentral in `ACTIVITY_METRIC_COLUMNS` (`src/lib/strava/schema.ts`) definiert. Fehlende Spalten ergänzt das Import-Skript automatisch per `ALTER TABLE` – neue Felder also dort und in `METRIC_SOURCES` (`scripts/import-strava.ts`) eintragen und `yarn strava:import` erneut ausführen.
- Nicht übernommen: private Notizen, GPS-/FIT-Dateien sowie im Export immer leere Spalten (`Max Watts`, `Max Temperature`, `Newly Explored Distance`).

### Relevante Dateien

| Datei | Zweck |
| ----- | ----- |
| `scripts/import-strava.ts` | CSV-Import (ausgeführt mit `tsx`) |
| `scripts/strava-auth.ts`, `scripts/strava-enrich.ts`, `scripts/strava-sync.ts` | Strava-API: OAuth, Enrichment, Sync |
| `scripts/lib/strava-api/` | API-Client (Tokens, Rate-Limits), Mapping API → DB, Schema-Migration |
| `src/lib/strava/activity-tags.ts` | Tags aus `workout_type`, `trainer`, `commute` |
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

Nach dem Login lädt der Server nur die Aktivitäten des aktuellen Jahres. Andere Jahre werden per URL-Parameter nachgeladen (`?year=2024`, `?year=all` für alle Jahre); Typ, Ausrüstung, Gerät, Tag und Sortierung (`?type=Ride&gear=…&device=Zwift&tag=race&sort=distance-desc`) werden clientseitig angewendet; `device=none` zeigt Aktivitäten ohne Gerät (noch nicht angereichert). Standard-Typ ist der Sammelfilter „Radfahren“ (Ride, E-Bike Ride, Virtual Ride, `?type=cycling`); alle Typen zeigt `?type=all`.

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
