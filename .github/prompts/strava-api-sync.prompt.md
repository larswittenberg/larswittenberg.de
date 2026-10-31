---
description: 'Strava-API-Anbindung: gemeinsamer API-Client, OAuth-Setup, Enrichment bestehender Aktivitäten (Gerät, Tags), manueller Sync neuer Aktivitäten in src/data/strava.db, Anzeige im Dashboard und Vorbereitung für GitHub Actions'
agent: 'agent'
---

# Strava-API-Anbindung: Enrichment- und Sync-Script

Rolle: Du bist ein Senior TypeScript/Node.js-Entwickler mit Erfahrung mit der Strava API v3, OAuth 2.0 und SQLite (`better-sqlite3`).

## Kontext (Ist-Zustand)

- Next.js-16-Projekt, TypeScript, Yarn 4, Node 24 (`.nvmrc`). Konventionen siehe `AGENTS.md` (Tabs, Single Quotes, ESLint, keine überflüssigen Kommentare).
- Aktivitäten liegen in **`src/data/strava.db`** (SQLite, wird committet und read-only im Dashboard `/projekte/strava` gelesen).
- **`scripts/import-strava.ts`** (`yarn strava:import`) liest `data/strava-export/activities.csv` (DE/EN-Export) und macht ein Upsert in die Tabelle `activities`. Alle Datensätze haben aktuell `source = 'export'` (~2000 Aktivitäten, 2016–heute).
- **`src/lib/strava/schema.ts`**: Tabellen-DDL, `ACTIVITY_METRIC_COLUMNS` und `ACTIVITY_EXTRA_COLUMNS` (fehlende Spalten werden per `ALTER TABLE` in `ensureSchema()` im Import-Script ergänzt). Die Spalte `source` erlaubt bereits `'export' | 'api'`.
- **`src/types/strava.ts`**: `StravaActivity` – Feldnamen spiegeln bewusst die Strava-API (snake_case).
- **`src/lib/strava/sport-types.ts`**: Sport-Typen in der DB sind die *Export-Namen*: `Ride`, `E-Bike Ride`, `Virtual Ride`, `Run`, `Walk`, `Hike`, `Workout`, `Yoga`, `Canoe`, `Kayaking`.
- `src/lib/strava/auth.ts` / `session.ts` sind der **Dashboard-Login** (nicht Strava-OAuth) – nicht anfassen, Namen nicht verwechseln (`STRAVA_SESSION_SECRET` ≠ Strava-API-Secret).
- Scripts laufen mit `tsx` (bereits Dependency).

## Ziel

Drei neue CLI-Scripts plus ein gemeinsames API-Modul:

| Script | Befehl | Zweck |
| --- | --- | --- |
| `scripts/strava-auth.ts` | `yarn strava:auth` | Einmaliger OAuth-Flow, speichert Tokens lokal |
| `scripts/strava-enrich.ts` | `yarn strava:enrich` | Erweitert **bestehende** Aktivitäten (nach Export-Import) um API-Daten: Gerät, Tags (workout_type, trainer), etc. |
| `scripts/strava-sync.ts` | `yarn strava:sync` | Holt bei Bedarf **neue** Aktivitäten aus Strava und speichert sie in der DB |

Dazu: Gerät und Tags im Dashboard anzeigen und filterbar machen (Abschnitt 7) und die Scripts so bauen, dass `strava:sync` später ohne Umbau in einer GitHub Action laufen kann (Abschnitt 8 – Workflow selbst wird **noch nicht** angelegt).

**Nicht Teil dieser Aufgabe:** Karten/Strecken (`map.summary_polyline`, Streams, GPS) und weitere API-Felder wie Kudos, Fotos, PRs.

Gemeinsame Grundlage in `scripts/lib/strava-api/` (nur von Scripts genutzt, nicht vom Next.js-Bundle):

- `client.ts` – Env laden, Token-Verwaltung inkl. Refresh, `stravaFetch()` mit Rate-Limit-Handling, Pagination-Helper
- `types.ts` – API-Typen (`SummaryActivity`, `DetailedActivity`, `TokenResponse`, … nur die genutzten Felder)
- `map-activity.ts` – Mapping API → DB-Zeile (inkl. Sport-Typ-Mapping)
- `db.ts` – DB öffnen (schreibend), `ensureSchema()` (aus `import-strava.ts` hierher bzw. nach `src/lib/strava/` extrahieren und im Import-Script wiederverwenden)

## 1. Token / OAuth (Setup-Anleitung + `strava:auth`)

### Strava-App anlegen (manuell, einmalig)

1. https://www.strava.com/settings/api → App erstellen.
2. **Authorization Callback Domain:** `localhost` (erlaubt jeden Port auf localhost).
3. `Client ID` und `Client Secret` in `.env.local` eintragen:

```bash
STRAVA_CLIENT_ID=12345
STRAVA_CLIENT_SECRET=<client-secret>
```

### `yarn strava:auth`

- Startet einen kurzlebigen HTTP-Server auf `http://localhost:8723/callback` (Port per `--port` änderbar).
- Gibt die Authorize-URL aus (und öffnet sie optional per `open`):
  `https://www.strava.com/oauth/authorize?client_id=…&response_type=code&redirect_uri=http://localhost:8723/callback&approval_prompt=force&scope=read,activity:read_all`
  - `activity:read_all` ist nötig, damit auch private („Nur ich“) Aktivitäten und Privacy-Zone-Daten geliefert werden.
- Prüft im Callback `state` (zufällig generiert) und den tatsächlich gewährten `scope` (Abbruch mit klarer Meldung, wenn `activity:read_all` fehlt).
- Tauscht den `code` per `POST https://www.strava.com/oauth/token` (`grant_type=authorization_code`) gegen Tokens.
- Speichert `{ access_token, refresh_token, expires_at, athlete_id, scope }` in **`data/strava-tokens.json`** (Dateirechte `0600`) und beendet den Server.
- `data/strava-tokens.json` in `.gitignore` aufnehmen.

### Token-Refresh (im `client.ts`)

- Access-Token läuft nach 6 h ab. Vor jedem Request: wenn `expires_at - 300s < now`, Refresh via `POST /oauth/token` mit `grant_type=refresh_token`.
- **Strava kann einen neuen Refresh-Token zurückgeben → immer den neuen Token persistieren.**
- Token-Quelle als austauschbaren `TokenStore` umsetzen (Interface mit `load()`/`save()`):
  - `FileTokenStore` (Default lokal): `data/strava-tokens.json`.
  - `EnvTokenStore` (für CI, aktiv wenn `STRAVA_TOKEN_STORE=env` oder `CI=true`): liest `STRAVA_REFRESH_TOKEN` aus der Env, hält den Access-Token nur im Speicher, schreibt keine Datei. Ändert sich der Refresh-Token beim Refresh, deutliche Warnung ausgeben (ohne Token-Wert), dass das Secret aktualisiert werden muss – Details siehe Abschnitt 8.
- Lokaler Fallback: Ist keine Token-Datei vorhanden, aber `STRAVA_REFRESH_TOKEN` gesetzt, damit refreshen und Datei anlegen. Sonst Abbruch mit Hinweis „`yarn strava:auth` ausführen“.
- Env laden: `process.loadEnvFile('.env.local')` (Node 24), nur wenn die Datei existiert.
- Tokens, Secrets und Authorization-Header **niemals loggen** (auch nicht in Fehlermeldungen/Stacktraces von Fetch-Responses).

## 2. Gemeinsamer API-Client (`scripts/lib/strava-api/client.ts`)

- Basis-URL `https://www.strava.com/api/v3`, natives `fetch`.
- `stravaFetch<T>(path, query?)`:
  - Bearer-Token automatisch, Refresh siehe oben; bei `401` einmal refreshen und wiederholen.
  - Liest nach jeder Response die Header `X-RateLimit-Limit`/`X-RateLimit-Usage` sowie `X-ReadRateLimit-Limit`/`X-ReadRateLimit-Usage` (Format `"<15min>,<daily>"`) und stellt den aktuellen Stand bereit (`getRateLimitState()`). Limits nicht hardcoden, sondern aus den Headern nehmen (Default aktuell ca. 100 Read-Requests/15 min und 1000/Tag).
  - Vor jedem Request: Ist das 15-min-Limit (mit Puffer, z. B. 5 Requests) erreicht → bis zum nächsten Viertelstunden-Fenster warten (Strava setzt um :00/:15/:30/:45 zurück), Countdown loggen. Ist das Tageslimit erreicht → `DailyLimitReachedError` werfen, damit das aufrufende Script sauber beenden kann (Reset um Mitternacht UTC).
  - Bei `429`: wie 15-min-Limit behandeln und erneut versuchen; bei `5xx`: begrenzte Retries mit Backoff.
  - `404` als eigener Fehlertyp (`NotFoundError`), damit gelöschte Aktivitäten erkannt werden.
- `paginate<T>(path, query)` – Async-Generator über `page`/`per_page=200`, bis eine leere Seite kommt.
- Kleine Helper: `getActivity(id)` → `GET /activities/{id}?include_all_efforts=false`, `listActivities({ after, before })` → `GET /athlete/activities`, `getAthlete()` → `GET /athlete` (für Gear-Namen `bikes[]`/`shoes[]`).

## 3. Schema-Erweiterung (`src/lib/strava/schema.ts`)

Neue nullable Spalten in `ACTIVITY_EXTRA_COLUMNS` (werden per bestehendem `ALTER TABLE`-Mechanismus ergänzt; DDL in `CREATE_ACTIVITIES_TABLE` ebenfalls ergänzen):

| Spalte | Typ | Quelle (DetailedActivity) |
| --- | --- | --- |
| `device_name` | TEXT | `device_name` (z. B. „Garmin Edge 840“, „Zwift“, „Strava App“) |
| `workout_type` | INTEGER | `workout_type` (Run: 0 Standard, 1 Wettkampf, 2 Langer Lauf, 3 Training; Ride: 10 Standard, 11 Rennen, 12 Training) |
| `trainer` | INTEGER (0/1) | `trainer` (Indoor/Rolle) |
| `visibility` | TEXT | `visibility` (`everyone` / `followers_only` / `only_me`) |
| `external_id` | TEXT | `external_id` (Original-Dateiname vom Gerät/Upload) |
| `gear_id` | TEXT | `gear_id` |
| `start_date_local` | TEXT | `start_date_local` |
| `timezone` | TEXT | `timezone` |
| `api_synced_at` | TEXT | Zeitpunkt des letzten erfolgreichen Detail-Abrufs (ISO, UTC) |
| `api_status` | TEXT | `'ok'` oder `'not_found'` (gelöscht/kein Zugriff) |

- Typen in `src/types/strava.ts` ergänzen (eigener Typ z. B. `StravaActivityApiFields`, damit `StravaActivity` aus dem Export-Import gültig bleibt).
- Tag-Helper in `src/lib/strava/activity-tags.ts` anlegen (wird vom Dashboard genutzt, siehe Abschnitt 7):
  - `WORKOUT_TYPE_LABELS`: `1 → 'Wettkampf'`, `2 → 'Langer Lauf'`, `3 → 'Training'`, `11 → 'Rennen'`, `12 → 'Training'`; `0`/`10`/`NULL` = Standard, kein Tag.
  - `getActivityTags(activity): ActivityTag[]` liefert die anzuzeigenden Tags aus `workout_type`, `trainer` (`'Indoor'`) und `commute` (`'Pendeln'`), jeweils mit stabilem Key für Filter/URL (z. B. `race`, `long-run`, `workout`, `indoor`, `commute`).

### Zusammenspiel mit `import-strava.ts`

- Das Import-Upsert schreibt nur explizit gelistete Spalten → die neuen API-Spalten bleiben bei einem erneuten Export-Import erhalten. Sicherstellen, dass das so bleibt (API-Spalten **nicht** in die Import-Spaltenliste aufnehmen).
- `--only-new` im Import soll Zeilen mit `source = 'api'` als „noch nicht aus dem Export“ behandeln und sie mit Export-Daten überschreiben (Export liefert mehr Metriken, z. B. Wetter, Relative Effort, Dateiname). Danach `source = 'export'`.
- `ensureSchema()` an eine gemeinsame Stelle verschieben und in allen drei Scripts nutzen.

## 4. `yarn strava:enrich` – bestehende Daten erweitern

Workflow: Export herunterladen → `yarn strava:import` → `yarn strava:enrich` (ggf. über mehrere Tage, bis alles angereichert ist).

- Auswahl: `SELECT id FROM activities WHERE api_synced_at IS NULL ORDER BY start_date DESC` (neueste zuerst).
- Pro Aktivität `getActivity(id)` und **nur** die API-Spalten aus Abschnitt 3 per `UPDATE` setzen + `api_synced_at`, `api_status = 'ok'`. Bestehende Export-Werte werden nicht überschrieben.
  - Optional `--fill-gaps`: zusätzlich Export-Spalten befüllen, die aktuell `NULL` sind (z. B. `calories`, `average_temp`), niemals vorhandene Werte überschreiben.
- `404` → `api_status = 'not_found'`, `api_synced_at` setzen (wird nicht erneut versucht, außer mit `--retry-not-found`).
- Jede Aktivität sofort committen (kein großer Transaktions-Block) → Script ist jederzeit abbrechbar (Ctrl+C) und **fortsetzbar**.
- Bei `DailyLimitReachedError`: sauber beenden mit Zusammenfassung „X angereichert, Y offen, weiter ab morgen“. Exit-Code 0.
- Rate-Limit-Rechnung ausgeben: bei ~2000 Aktivitäten und ~1000 Read-Requests/Tag dauert der erste Komplettlauf ca. 2 Tage.
- CLI-Optionen (`node:util` `parseArgs`, analog zum Import-Script):
  - `--dry-run` (nichts schreiben, Beispiel-Tabelle per `console.table` mit `id`, Datum, Typ, Name, `device_name`, `workout_type`, `trainer`)
  - `--limit N`
  - `--ids 123,456` (gezielt einzelne Aktivitäten)
  - `--since YYYY-MM-DD` / `--until YYYY-MM-DD`
  - `--force` (auch bereits angereicherte erneut abrufen)
  - `--retry-not-found`
  - `--no-wait` (bei erreichtem 15-min-Limit beenden statt warten)
  - `--db PATH`
- Fortschritt: `[123/1986] 2024-05-01 Ride "Feierabendrunde" → Garmin Edge 840, workout_type 10` und Rate-Limit-Stand alle N Requests.

## 5. `yarn strava:sync` – neue Aktivitäten holen

- Zeitraum: `after` = `MAX(start_date)` aus der DB minus Überlappung (Default 3 Tage, `--overlap-days`), alternativ `--since YYYY-MM-DD` oder `--days N`.
- `listActivities({ after })` paginiert → Summary-Liste.
- Für jede Aktivität, die **nicht** in der DB ist: `getActivity(id)` (Details liefern `device_name`, `description`, `calories`, `gear.name`) → auf `StravaActivity` + API-Spalten mappen, `source = 'api'`, `filename = null`, `api_synced_at`/`api_status` setzen, `INSERT`.
- Bereits vorhandene Aktivitäten im Überlappungsfenster: standardmäßig nur API-Spalten aktualisieren, wenn `api_synced_at IS NULL` (spart Requests). Mit `--update-existing` zusätzlich Basisfelder (`name`, `sport_type`, `description`, `commute`, `gear_name`) aktualisieren – nachträgliche Änderungen in Strava.
- `--no-details`: nur Summary-Daten speichern (spart Requests; `device_name`/`description`/`calories` bleiben `NULL`, `api_synced_at` bleibt `NULL`, damit `strava:enrich` sie später nachholt).
- Weitere Optionen: `--dry-run`, `--limit N`, `--db PATH`, `--no-wait` (wie bei `enrich`).
- Ausgabe: Anzahl gefunden / neu / aktualisiert / übersprungen, Rate-Limit-Stand, Hinweis „`src/data/strava.db` committen und deployen“.
- **CI-tauglich** (Vorbereitung für Abschnitt 8):
  - Rein nicht-interaktiv; keine Prompts, kein Browser.
  - Exit-Codes: `0` = Erfolg (auch „nichts Neues“ und „Tageslimit erreicht“), `1` = Fehler (Auth, Netzwerk nach Retries, DB).
  - Am Ende eine maschinenlesbare Zusammenfassung: Ist `GITHUB_STEP_SUMMARY` gesetzt, eine kurze Markdown-Tabelle (neu/aktualisiert/übersprungen, Rate-Limit) dort anhängen. Ist `GITHUB_OUTPUT` gesetzt, `new_count=<n>` und `changed=true|false` schreiben. Keine Aktivitätsnamen/Beschreibungen in die Summary (Repo ist privat, Actions-Logs trotzdem sparsam halten).
  - In CI standardmäßig wie `--no-wait` verhalten (`CI=true`), damit der Job nicht minutenlang auf das 15-min-Fenster wartet.

## 6. Mapping API → DB (`map-activity.ts`)

- **Sport-Typ:** API-`sport_type` auf die Export-Namen der DB mappen, z. B. `EBikeRide → 'E-Bike Ride'`, `VirtualRide → 'Virtual Ride'`, `Canoeing → 'Canoe'`; `Ride`, `Run`, `Walk`, `Hike`, `Workout`, `Yoga`, `Kayaking` 1:1. Unbekannte Typen: Warnung ausgeben und Rohwert speichern (analog zur Fehlermeldung bei `ACTIVITY_TYPE_DE`). Gegen die vorhandenen Werte in `sport-types.ts` prüfen.
- **Direkt übernehmbar:** `name`, `start_date`, `description`, `distance`, `moving_time`, `elapsed_time`, `total_elevation_gain`, `average_speed`, `max_speed`, `average_heartrate`, `max_heartrate`, `average_watts`, `weighted_average_watts`, `kilojoules`, `calories`, `elev_low`, `elev_high`, `average_cadence`, `average_temp`, `commute`.
- `gear_name`: aus `detail.gear.name`, sonst über `gear_id` aus `getAthlete()` (einmal pro Lauf cachen).
- `relative_effort`: `suffer_score`, falls vorhanden, sonst `NULL`.
- **Nicht über die API verfügbar** (bleiben `NULL`, kommen erst über den nächsten Export): Wetter-Spalten, `elevation_loss`, `max_grade`, `average_grade`, `max_cadence`, `training_load`, `intensity`, `grade_adjusted_distance`, `average_grade_adjusted_speed`, `total_steps`, `dirt_distance`, `athlete_weight`, `bike_weight`, `filename`. Im Code als Liste dokumentieren.
- Einheiten sind identisch zum Export (m, s, m/s) – Kommentar-Referenz auf `ACTIVITY_METRIC_COLUMNS`.

## 7. Dashboard: Gerät und Tags anzeigen

Bestehende Dateien erweitern, Stil und Muster beibehalten:

- **`src/lib/strava/db.ts`**: `device_name`, `workout_type`, `trainer` und `commute` in `LIST_COLUMNS` aufnehmen; `StravaActivityListItem` entsprechend anpassen (`commute`/`trainer` als `0 | 1` aus SQLite oder im Mapping zu `boolean` wandeln – einheitlich lösen).
- **`src/components/projects/strava/strava-dashboard.tsx`**:
  - **Tabelle:** Tags aus `getActivityTags()` als kleine, dezente Badges hinter dem Aktivitätsnamen (Tailwind, Dark Mode beachten, keine neue Spalte, damit die Tabelle nicht breiter wird). Standard-Aktivitäten ohne Tag zeigen nichts.
  - **Details (`getDetails`, Gruppe „Allgemein“):** Eintrag `Gerät` (`device_name`) direkt nach `Ausrüstung`; Eintrag `Tags` (kommagetrennte Labels), falls vorhanden. Leere Werte werden – wie bisher – automatisch ausgeblendet.
  - **Filter:** zwei neue `Select`-Filter analog zum Ausrüstungs-Filter:
    - `Gerät`: alle vorkommenden `device_name`-Werte sortiert + „Unbekannt“ (für Aktivitäten ohne API-Daten). URL-Parameter `device`.
    - `Tag`: „Alle“ + die Tag-Keys aus `activity-tags.ts` (nur Tags anzeigen, die im aktuellen Jahr vorkommen). URL-Parameter `tag`.
    - `Filters`-Typ, `writeFiltersToUrl`, Reset-Button, `hasActiveFilters` und `filterLabel` („Auswahl: …“) entsprechend erweitern.
  - Responsives Layout der Filterleiste prüfen (jetzt 6 Selects).
- Aktivitäten ohne API-Daten (`api_synced_at IS NULL`) funktionieren unverändert; Gerät fehlt dann einfach.
- Charts (`/projekte/strava/charts`) bleiben unverändert.

## 8. Vorbereitung GitHub Actions (noch nicht umsetzen)

Der Workflow wird **jetzt nicht** angelegt. Die Umsetzung muss aber so sein, dass er später nur noch als Datei ergänzt werden muss:

- Scripts erfüllen die CI-Anforderungen aus Abschnitt 2 (`EnvTokenStore`) und 5 (Exit-Codes, `GITHUB_STEP_SUMMARY`/`GITHUB_OUTPUT`, kein Warten).
- In `README.md` einen Abschnitt „Strava-Sync per GitHub Action (geplant)“ ergänzen mit:
  - Benötigte Secrets: `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REFRESH_TOKEN` (Wert aus `data/strava-tokens.json`).
  - **Refresh-Token-Rotation:** Strava kann beim Refresh einen neuen Refresh-Token ausgeben; der alte wird dann irgendwann ungültig. Lösungsoptionen dokumentieren: (a) Script erkennt Änderung und der Workflow aktualisiert das Secret per `gh secret set STRAVA_REFRESH_TOKEN` (benötigt einen Token mit Schreibrecht auf Repository-Secrets; Wert nur über stdin übergeben, nie loggen), (b) Job schlägt mit klarer Meldung fehl und das Secret wird manuell erneuert. Empfehlung: (a).
  - Skizze des späteren Workflows (`.github/workflows/strava-sync.yml`) als Codeblock im README, angelehnt an `.github/workflows/update-data.yml`: `workflow_dispatch` + `schedule` (z. B. täglich), `permissions: contents: write`, Node aus `.nvmrc` (24) statt fest `20`, `yarn install --immutable`, `yarn strava:sync`, danach `src/data/strava.db` nur committen, wenn sich etwas geändert hat (`chore: update strava activities`). Der Push löst das Vercel-Deployment aus.
  - Hinweis: `enrich` bleibt bewusst manuell/lokal (hoher Request-Bedarf).
- Concurrency-Hinweis für später: `concurrency: strava-sync`, damit sich manueller und geplanter Lauf nicht überschneiden; lokal vor einem eigenen `strava:sync` erst `git pull`, um Merge-Konflikte in der Binärdatei `strava.db` zu vermeiden.

## 9. Sonstiges

- `package.json`-Scripts ergänzen: `strava:auth`, `strava:enrich`, `strava:sync` (jeweils `tsx scripts/….ts`).
- `.gitignore`: `data/strava-tokens.json`.
- Doku aktualisieren:
  - `README.md`, Abschnitt „Projekte - Strava Dashboard“: Setup der Strava-App, `yarn strava:auth`, empfohlener Workflow (Export → Import → Enrich; laufend: Sync), Rate-Limits, Commit der DB, neue Dashboard-Filter, GitHub-Action-Vorbereitung (Abschnitt 8).
  - `AGENTS.md`: neue Env-Variablen (`STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, optional `STRAVA_REFRESH_TOKEN`, `STRAVA_TOKEN_STORE`), neue Befehle, Token-Datei als Secret, Hinweis auf den geplanten Workflow.
- Keine neuen Dependencies, sofern nicht zwingend nötig (natives `fetch`, `node:http`, `node:util`, `node:crypto`).
- Kein Test-Framework vorhanden; reine Funktionen (Sport-Typ-Mapping, Rate-Limit-Header-Parsing, Mapping API → DB, `getActivityTags`) so schreiben, dass sie testbar sind.

## Akzeptanzkriterien

- [ ] `yarn strava:auth` legt `data/strava-tokens.json` an; Datei ist gitignored; keine Tokens im Log.
- [ ] Abgelaufene Tokens werden automatisch refreshed und der neue Refresh-Token gespeichert.
- [ ] `yarn strava:enrich --dry-run --limit 5` zeigt Gerät/Tags ohne DB-Änderung.
- [ ] `yarn strava:enrich` ist abbrechbar und setzt beim nächsten Start nahtlos fort; stoppt sauber am Tageslimit.
- [ ] Ein erneutes `yarn strava:import` überschreibt keine API-Spalten.
- [ ] `yarn strava:sync --dry-run` listet neue Aktivitäten; ohne `--dry-run` landen sie mit `source = 'api'` in der DB und erscheinen im Dashboard.
- [ ] `yarn strava:import --only-new` ersetzt API-Zeilen durch Export-Daten (API-Spalten bleiben erhalten).
- [ ] `CI=true STRAVA_REFRESH_TOKEN=… yarn strava:sync` läuft ohne Token-Datei, wartet nicht und schreibt eine Summary, falls `GITHUB_STEP_SUMMARY` gesetzt ist.
- [ ] Dashboard zeigt Tags als Badges in der Tabelle sowie Gerät/Tags in den Details; Filter `Gerät` und `Tag` funktionieren inkl. URL-Parametern und Reset.
- [ ] Kein Workflow-File unter `.github/workflows/` angelegt; Workflow-Skizze und Secrets sind im README dokumentiert.
- [ ] `yarn lint`, `yarn typecheck` und `yarn build` laufen fehlerfrei.

## Entscheidungen (geklärt)

1. Gerät und Tags werden im Dashboard angezeigt und sind filterbar (Abschnitt 7).
2. Keine weiteren API-Felder; Karten/Strecken bleiben vorerst außen vor.
3. GitHub Action für `strava:sync` ist geplant: Scripts und Doku werden vorbereitet, der Workflow selbst wird später umgesetzt.
