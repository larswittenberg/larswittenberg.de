# Strava – API (Auth, Enrichment, Sync)

Drei Skripte ergänzen den [Export](Export-Import.md) über die Strava-API v3 (gemeinsamer Client in `scripts/lib/strava-api/`):

| Befehl | Zweck |
| ------ | ----- |
| `yarn strava:auth` | Einmaliger OAuth-Flow, speichert Tokens in `data/strava-tokens.json` |
| `yarn strava:enrich` | Ergänzt **bestehende** Aktivitäten um Strava-Sportart, Gerät, `workout_type`, Indoor, Sichtbarkeit u. a. |
| `yarn strava:sync` | Holt **neue** Aktivitäten aus Strava (`source = 'api'`) |

## Einrichtung (einmalig)

1. Unter <https://www.strava.com/settings/api> eine App anlegen, **Authorization Callback Domain:** `localhost`.
2. Client-ID und Client-Secret in `.env.local` eintragen:

    ```env
    STRAVA_CLIENT_ID=12345
    STRAVA_CLIENT_SECRET="..."
    ```

3. `yarn strava:auth` ausführen und die angezeigte URL öffnen (`--open` öffnet den Browser automatisch, `--port` ändert den Port 8723). **Alle Berechtigungen erlauben** – `activity:read_all` ist nötig, damit auch private Aktivitäten geliefert werden.
4. Die Tokens landen in `data/strava-tokens.json` (Dateirechte `0600`, in der `.gitignore`, **nie committen**).

### Tokens

- Der Access-Token läuft nach 6 h ab und wird automatisch erneuert; ein neuer Refresh-Token wird jeweils gespeichert.
- Fehlt die Token-Datei, aber `STRAVA_REFRESH_TOKEN` ist gesetzt, wird damit refresht und die Datei angelegt.
- Mit `STRAVA_TOKEN_STORE=env` (bzw. automatisch bei `CI=true`) wird keine Datei gelesen/geschrieben, nur `STRAVA_REFRESH_TOKEN` genutzt.
- Bei „Keine Strava-Tokens gefunden“ oder „Token-Anfrage fehlgeschlagen“: `yarn strava:auth` erneut ausführen (z. B. nach Widerruf des Zugriffs in den Strava-Einstellungen).

## Rate-Limits

- Strava erlaubt standardmäßig ca. **100 Read-Requests je 15 Minuten** und **1000 pro Tag**. Die tatsächlichen Werte werden aus den Response-Headern gelesen und regelmäßig ausgegeben (`Rate-Limit: 15 min 42/100, Tag 310/1000`).
- Am 15-min-Limit wartet das Skript bis zum nächsten Fenster (:00/:15/:30/:45) mit Countdown und läuft dann **automatisch weiter**. `--no-wait` beendet stattdessen.
- Am Tageslimit beendet es sich sauber (Exit-Code 0). Reset um 00:00 UTC (= 01:00 Winterzeit / 02:00 Sommerzeit).
- Jede Aktivität wird sofort gespeichert; **Abbruch mit Ctrl+C ist jederzeit möglich**, auch während des Wartens. Ein erneuter Aufruf setzt genau dort fort.

## `yarn strava:enrich` – bestehende Aktivitäten anreichern

Holt für jede Aktivität in der DB, die noch keine API-Daten hat (`api_synced_at IS NULL`), die Details (1 Request pro Aktivität, neueste zuerst) und schreibt nur die API-Spalten. Export-Werte werden nicht überschrieben. Der erste Komplettlauf über ~2000 Aktivitäten dauert ca. 2 Tage.

```bash
# Testlauf: 10 Aktivitäten abrufen, nichts schreiben
yarn strava:enrich --dry-run --limit 10

# Alle noch nicht angereicherten Aktivitäten
yarn strava:enrich

# Gezielt einzelne Aktivitäten (unabhängig vom Status)
yarn strava:enrich --ids 123,456

# Ein Jahr erneut abrufen
yarn strava:enrich --since 2024-01-01 --until 2024-12-31 --force
```

| Option | Beschreibung |
| ------ | ------------ |
| `--dry-run` | Ruft die API ab, schreibt nichts, zeigt eine Tabelle mit Sportart/Gerät/Tags. |
| `--limit N` | Höchstens N Aktivitäten. |
| `--ids 123,456` | Nur diese Aktivitäten. |
| `--since` / `--until YYYY-MM-DD` | Zeitraum eingrenzen. |
| `--force` | Auch bereits angereicherte Aktivitäten erneut abrufen. |
| `--retry-not-found` | Als `not_found` markierte Aktivitäten erneut versuchen. |
| `--fill-gaps` | Zusätzlich leere Export-Spalten (z. B. `calories`, `average_temp`) befüllen, nie vorhandene Werte überschreiben. |
| `--no-wait` | Am 15-min-Limit beenden statt warten. |
| `--db PATH` | Datenbankdatei. |

Gelöschte oder nicht zugängliche Aktivitäten bekommen `api_status = 'not_found'` und werden nicht erneut versucht (außer mit `--retry-not-found`).

## `yarn strava:sync` – neue Aktivitäten holen

Fragt alle Aktivitäten ab der neuesten in der DB minus 3 Tage Überlappung ab. Neue Aktivitäten werden mit Details gespeichert (`source = 'api'`). Vorhandene Aktivitäten im Zeitraum ohne API-Daten werden dabei gleich mit angereichert. Dabei werden auch die Startkoordinaten (`start_latlng`) gerundet als `start_lat`/`start_lng` gespeichert (siehe Mapping).

```bash
git pull
yarn strava:sync --dry-run
yarn strava:sync
```

| Option | Beschreibung |
| ------ | ------------ |
| `--dry-run` | Listet neue Aktivitäten (nur Summary-Requests), schreibt nichts. |
| `--overlap-days N` | Überlappung zur neuesten Aktivität in der DB (Standard: 3). |
| `--since YYYY-MM-DD` / `--days N` | Alternativer Startzeitpunkt. |
| `--limit N` | Höchstens N neue Aktivitäten. |
| `--update-existing` | Vorhandene Aktivitäten im Zeitraum aktualisieren (`name`, `sport_type`, `description`, `commute`, `gear_name`) – z. B. nach nachträglichen Änderungen in Strava. |
| `--no-details` | Nur Summary-Daten speichern (spart Requests; Gerät/Beschreibung/Kalorien holt später `strava:enrich`). |
| `--no-wait` | Am 15-min-Limit beenden statt warten (in CI Standard). |
| `--db PATH` | Datenbankdatei. |

Danach `src/data/strava.db` committen und pushen.

## Mapping API → DB

- **Sportart:** Die API-Sportart wird auf den Export-Namen abgebildet (`EBikeRide` → `E-Bike Ride`, `VirtualRide` → `Virtual Ride`, `Canoeing` → `Canoe` …, siehe `API_SPORT_TYPES` in `src/lib/strava/sport-types.ts`). Feinere Sportarten wie `GravelRide` oder `MountainBikeRide` landen über den alten API-Wert `type` als `Ride` in `sport_type` – genau wie im Export. Der Originalwert bleibt in `api_sport_type` erhalten. Komplett unbekannte Sportarten werden mit Warnung als Rohwert gespeichert.
- **Nur im Export, bei API-Zeilen bis zum nächsten Export leer:** Wetter, Höhenverlust, Steigung, max. Trittfrequenz, Training Load, Intensität, GAP, Schritte, Schotter-Distanz, Gewichte, Dateiname (siehe `API_UNAVAILABLE_COLUMNS` in `scripts/lib/strava-api/map-activity.ts`).
- **Ausrüstungsname:** kommt aus den Aktivitätsdetails. Bei `--no-details` wird `/athlete` gefragt, das Ausrüstung aber nur mit Scope `profile:read_all` liefert – dann bleibt `gear_name` leer.
- **Startkoordinaten (nur `strava:sync`):** `start_latlng` wird auf 3 Nachkommastellen gerundet (ca. 110 m, `COORDINATE_DECIMALS`) in `start_lat`/`start_lng` gespeichert. Mit `activity:read_all` liefert die API den echten Startpunkt, auch innerhalb von Privatsphäre-Zonen – daher nie genauer speichern. Ohne GPS (leeres `start_latlng`) bleibt die Spalte leer; vorhandene Werte werden nie mit `NULL` überschrieben. `strava:enrich` schreibt keine Koordinaten – für ältere Aktivitäten gibt es `yarn strava:start-location` (lokal aus den Export-Dateien, siehe [Export-Import.md](Export-Import.md)).
- Karten/Strecken (Polyline, GPS-Streams), Kudos, Fotos und Bestzeiten werden nicht abgerufen.
