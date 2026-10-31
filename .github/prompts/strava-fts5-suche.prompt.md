# Umsetzungsplan: Volltextsuche über Strava-Aktivitäten (SQLite FTS5)

Ziel: Eingabefeld im Strava-Dashboard, das Name, Beschreibung, Ausrüstung und Sportart aller Aktivitäten durchsucht und passende Aktivitäten nach Relevanz anzeigt.

Ausgangslage:

- Daten liegen in [strava.db](../src/data/strava.db) (SQLite, `better-sqlite3`, readonly zur Laufzeit).
- Jahr wird serverseitig gefiltert (`?year=` in `getDashboardData` in [db.ts](../src/lib/strava/db.ts)).
- Sportart, Ausrüstung und Sortierung werden im Client über die URL gefiltert ([strava-dashboard.tsx](../src/components/projects/strava/strava-dashboard.tsx)).
- Die Seite ist login-geschützt, daher kein öffentlicher Suchindex unter `public/`.

## 1. Schema: FTS-Tabelle ([schema.ts](../src/lib/strava/schema.ts))

Neue Konstante `CREATE_ACTIVITIES_FTS`:

```sql
CREATE VIRTUAL TABLE IF NOT EXISTS activities_fts USING fts5(
  name, description, gear_name, sport_label,
  tokenize = 'unicode61 remove_diacritics 2'
);
```

- `rowid` = `activities.id`.
- Die Tabelle speichert ihren Text selbst (nicht an `activities` gekoppelt). So kann `sport_label` den deutschen Namen aus [sport-types.ts](../src/lib/strava/sport-types.ts) enthalten, damit z. B. „Radfahrt“ auch `Ride` findet. Englischer und deutscher Name können beide hinein.
- `remove_diacritics 2` sorgt dafür, dass `uber` auch „Über“ findet und die Groß-/Kleinschreibung egal ist.

## 2. Import: Index befüllen ([import-strava.ts](../scripts/import-strava.ts))

- Nach dem Upsert in derselben Transaktion `DELETE FROM activities_fts` ausführen und den Index aus `SELECT id, name, description, gear_name, sport_type FROM activities` neu aufbauen. Die Sportart wird dabei in JS auf das Label abgebildet.
- Den Index immer komplett neu bauen, auch bei `--only-new`. Bei rund 2.000 Zeilen dauert das Millisekunden und braucht keine Trigger oder Synchronisierungslogik.
- Danach `INSERT INTO activities_fts(activities_fts) VALUES('optimize')` ausführen.
- `--dry-run` fasst den Index nicht an.
- Einmal `yarn strava:import` ausführen und die neue `strava.db` committen, denn die App öffnet sie nur lesend.

## 3. Abfrage ([db.ts](../src/lib/strava/db.ts))

- **Hilfsfunktion `toFtsQuery(input)`:**
  - zerlegt die Eingabe an Leerzeichen und entfernt `"`,
  - macht aus jedem Wort `"wort"*` (Präfixsuche) und verknüpft alles mit UND,
  - begrenzt die Eingabe auf ca. 100 Zeichen und 8 Wörter,
  - gibt bei leerer Eingabe `null` zurück, dann bleibt das bisherige Verhalten.

  Dadurch können Nutzer keine FTS-Syntax einschleusen, und es gibt keine Syntax-Exceptions.
- **`getDashboardData(year, q)` erweitern:**

  ```sql
  SELECT a.<LIST_COLUMNS>,
         bm25(activities_fts, 10, 4, 2, 1) AS rank,
         highlight(activities_fts, 0, char(2), char(3)) AS name_hl,
         snippet(activities_fts, 1, char(2), char(3), '…', 16) AS description_snippet
  FROM activities_fts f
  JOIN activities a ON a.id = f.rowid
  WHERE activities_fts MATCH ? [AND Jahresfilter]
  ORDER BY rank
  ```

  Die Gewichte bei `bm25` lauten Name 10, Beschreibung 4, Ausrüstung 2, Sportart 1.
- Neues Rückgabefeld `query`. `StravaActivityListItem` bekommt optional `rank`, `name_hl` und `description_snippet`.
- `isAuthenticated()` bleibt der Schutz.

## 4. Seite ([page.tsx](../src/app/projekte/strava/page.tsx))

- `q` aus `searchParams` lesen und an `getDashboardData` weitergeben.

## 5. UI ([strava-dashboard.tsx](../src/components/projects/strava/strava-dashboard.tsx))

- **Suchfeld:** `<input type="search">` mit Lupen-Icon (`lucide-react`) in der vorhandenen Filterleiste.
  - Es ändert die URL mit 300 ms Debounce. Das läuft über dasselbe `router.replace` + `startTransition` wie `onYearChange`, also mit Server-Roundtrip und Ladezustand.
  - Escape oder ✕ leert die Suche. `resetFilters` entfernt auch `q`.
- **Sortierung:** neue Option „Relevanz“. Sie ist die Standard-Sortierung, solange `q` gesetzt ist, und behält die Reihenfolge vom Server bei.
- **Trefferzeile:** „23 Treffer für „Ostsee““ und ein eigener Hinweis, wenn nichts gefunden wurde.
- **Hervorhebung:** Eine kleine Komponente `<Highlighted text>` zerlegt den Text an den Markern `\u0002`/`\u0003` und rendert die Treffer als `<mark>`. Es wird kein `dangerouslySetInnerHTML` gebraucht. In der Liste zeigt sie den Namen und das Beschreibungs-Snippet.

## 6. Doku und Prüfung

- [AGENTS.md](../AGENTS.md) und [README.md](../README.md) bekommen einen kurzen Hinweis, dass der Import den FTS-Index baut.
- **Prüfung der DB:** Mit `sqlite3` folgende Abfragen testen: Umlaute, Präfixe, Groß-/Kleinschreibung, deutsche Sportart sowie Eingaben mit Sonderzeichen wie `"`, `*`, `(`, `-`, `OR`, `NEAR`.
- **Checks:** `yarn lint`, `yarn tsc --noEmit` und `yarn build`.
- **Im Browser:** Suche plus Jahr, Sportart und Ausrüstung kombinieren, Zurücksetzen und Hervorhebung prüfen.

## Offene Entscheidungen (Vorschlag)

1. **Jahr bei aktiver Suche:** Automatisch über alle Jahre suchen. Wählt man im Jahresfeld ein Jahr, schränkt das die Suche weiter ein. Sonst würde man nur das aktuelle Jahr durchsuchen.
2. **Sportart bei aktiver Suche:** Standard ist aktuell „Radfahren“. Bei aktiver Suche auf alle Sportarten umstellen.
3. **Umfang:** Für den Anfang Name, Beschreibung, Ausrüstung und Sportart. Kommentare aus `comments.csv` oder Ortsnamen per Reverse Geocoding könnten später in den Index.
