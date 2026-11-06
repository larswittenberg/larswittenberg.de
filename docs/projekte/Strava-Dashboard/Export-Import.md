# Strava – Export-Import

Der Strava-Datenexport ist die Hauptquelle für die Datenbank: Er enthält alle Aktivitäten mit den meisten Metriken (inkl. Wetter, Training Load, Schritte). Gerät, Tags und genaue Sportart kommen zusätzlich über die [Strava-API](Strava-API.md).

## Export herunterladen

1. Strava → Einstellungen → Mein Konto → „Konto herunterladen“ → Archiv anfordern (kommt per Mail, kann einige Stunden dauern).
2. ZIP entpacken nach `data/strava-export/` (alten Inhalt ersetzen). Benötigt wird nur `activities.csv`.

> `data/strava-export/` ist in der `.gitignore` und darf nie eingecheckt werden (enthält GPS-Dateien, Nachrichten, Logins etc.).

## Import

```bash
# Testlauf mit 20 Aktivitäten, schreibt nichts
yarn strava:import --dry-run --limit 20

# Testlauf über alle Aktivitäten
yarn strava:import --dry-run

# Import (vorhandene Einträge werden aktualisiert)
yarn strava:import

# Nur Aktivitäten, die noch nicht aus einem Export stammen
yarn strava:import --only-new
```

| Option | Beschreibung |
| ------ | ------------ |
| `--dry-run` | Parst und validiert nur, zeigt Statistik und eine Beispieltabelle. Schreibt nichts, Exit-Code 1 bei ungültigen Zeilen. |
| `--limit N` | Nur die ersten N Zeilen der CSV verarbeiten. |
| `--only-new` | Bereits per Export importierte IDs überspringen (statt Upsert). Per `strava:sync` angelegte Zeilen (`source = 'api'`) werden durch die Export-Daten ersetzt. |
| `--export-dir PATH` | Export-Ordner (Standard: `data/strava-export`). |
| `--db PATH` | Datenbankdatei (Standard: `src/data/strava.db`). |

- Der Import läuft in einer Transaktion (alles oder nichts) und nutzt `ON CONFLICT(id) DO UPDATE`, kann also beliebig oft wiederholt werden.
- Die API-Spalten (`api_sport_type`, `device_name`, `workout_type`, `trainer` …) schreibt der Import nie – sie bleiben bei einem erneuten Import erhalten.

## Aktualisierung (alle paar Monate)

1. Neuen Export nach `data/strava-export/` entpacken.
2. `git pull`
3. `yarn strava:import --dry-run --only-new` – zeigt, wie viele Aktivitäten neu sind bzw. API-Zeilen ersetzt werden.
4. `yarn strava:import --only-new`
5. Optional `yarn strava:enrich` für Aktivitäten ohne API-Daten.
6. `src/data/strava.db` committen und pushen → Vercel deployt die neue DB.

## Sprache des Exports

Strava exportiert die CSV in der Sprache des Kontos. Das Skript erkennt englische und deutsche Exporte automatisch (`export language: de` in der Ausgabe):

- Deutsche Spaltennamen werden über `HEADER_DE` auf die englischen abgebildet.
- Deutsche Aktivitätsarten (z. B. `Radfahrt` → `Ride`) über `ACTIVITY_TYPE_DE` (beides in `scripts/import-strava.ts`), damit Filter und Charts weiter funktionieren.
- Taucht eine neue deutsche Aktivitätsart auf, meldet der Dry-Run sie als Fehler – dann dort ergänzen.

## Was der Export *nicht* enthält

- Gerät (`device_name`), Wettkampf/Training-Markierung (`workout_type`), Indoor (`trainer`), Sichtbarkeit.
- Die genaue Sportart: Gravel- und MTB-Fahrten erscheinen nur als `Ride`/`Radfahrt`.

Diese Infos liefert `yarn strava:enrich` → [Strava-API.md](Strava-API.md).
