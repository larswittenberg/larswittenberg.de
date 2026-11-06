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
- Die API-Spalten (`api_sport_type`, `device_name`, `workout_type`, `trainer` …) und die Startkoordinaten (`start_lat`, `start_lng`) schreibt der Import nie – sie bleiben bei einem erneuten Import erhalten.

## Aktualisierung (alle paar Monate)

1. Neuen Export nach `data/strava-export/` entpacken.
2. `git pull`
3. `yarn strava:import --dry-run --only-new` – zeigt, wie viele Aktivitäten neu sind bzw. API-Zeilen ersetzt werden.
4. `yarn strava:import --only-new`
5. `yarn strava:start-location` – Startkoordinaten der neuen Aktivitäten aus den Dateien lesen (siehe unten).
6. Optional `yarn strava:enrich` für Aktivitäten ohne API-Daten.
7. `src/data/strava.db` committen und pushen → Vercel deployt die neue DB.

## Startkoordinaten aus den Aktivitätsdateien

`yarn strava:start-location` liest den ersten gültigen GPS-Punkt aus den Dateien in `data/strava-export/activities/` (`.fit`, `.gpx`, `.tcx`, jeweils auch `.gz`) und speichert ihn als `start_lat`/`start_lng`. Läuft komplett lokal, **keine API-Requests**. Die Datei je Aktivität kommt aus der Spalte `filename`.

```bash
# Testlauf, zeigt eine Stichprobe, schreibt nichts
yarn strava:start-location --dry-run --limit 20

# Alle Aktivitäten ohne Koordinaten
yarn strava:start-location
```

| Option | Beschreibung |
| ------ | ------------ |
| `--dry-run` | Liest die Dateien, zeigt Statistik und Stichprobe, schreibt nichts. |
| `--limit N` | Höchstens N Aktivitäten (neueste zuerst). |
| `--force` | Auch Aktivitäten mit vorhandenen Koordinaten neu auslesen. |
| `--export-dir PATH` | Export-Ordner (Standard: `data/strava-export`). |
| `--db PATH` | Datenbankdatei (Standard: `src/data/strava.db`). |

- **Datenschutz:** Die Dateien enthalten den echten Startpunkt, Strava-Privatsphäre-Zonen gelten hier nicht. Gespeichert wird deshalb nur auf **3 Nachkommastellen gerundet** (ca. 110 m, `COORDINATE_DECIMALS` in `src/lib/strava/schema.ts`). Das Dashboard zeigt die Koordinaten derzeit nicht an.
- FIT: Startposition aus der Session, sonst der erste Track-Punkt mit Position (Garmin FIT SDK `@garmin/fitsdk`, Semicircles → Grad). GPX/TCX: erster Track-Punkt.
- Aktivitäten ohne GPS (Indoor, Zwift, manuell) bleiben `NULL` und werden bei jedem Lauf erneut geprüft – das ist schnell, da lokal.
- Am Ende steht eine Statistik: mit Koordinaten, ohne GPS, Datei fehlt, nicht unterstütztes Format, Fehler (defekte Datei → Exit-Code 1).
- Neue Aktivitäten aus `strava:sync` bekommen die Koordinaten direkt aus der API (siehe [Strava-API.md](Strava-API.md)).

## Sprache des Exports

Strava exportiert die CSV in der Sprache des Kontos. Das Skript erkennt englische und deutsche Exporte automatisch (`export language: de` in der Ausgabe):

- Deutsche Spaltennamen werden über `HEADER_DE` auf die englischen abgebildet.
- Deutsche Aktivitätsarten (z. B. `Radfahrt` → `Ride`) über `ACTIVITY_TYPE_DE` (beides in `scripts/import-strava.ts`), damit Filter und Charts weiter funktionieren.
- Taucht eine neue deutsche Aktivitätsart auf, meldet der Dry-Run sie als Fehler – dann dort ergänzen.

## Was der Export *nicht* enthält

- Gerät (`device_name`), Wettkampf/Training-Markierung (`workout_type`), Indoor (`trainer`), Sichtbarkeit.
- Die genaue Sportart: Gravel- und MTB-Fahrten erscheinen nur als `Ride`/`Radfahrt`.

Diese Infos liefert `yarn strava:enrich` → [Strava-API.md](Strava-API.md).
