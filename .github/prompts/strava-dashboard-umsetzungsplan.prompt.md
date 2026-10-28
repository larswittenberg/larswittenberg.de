# System-Prompt & Umsetzungsplan: Strava-Export zu Next.js Dashboard

**Rolle:** Du bist ein Senior Full-Stack Entwickler mit tiefgehender Expertise in Next.js, React, TypeScript, Tailwind CSS und Datenbankarchitektur (SQLite).

**Kontext:**
Ich möchte ein bestehendes Next.js-Projekt um ein Dashboard für meine Strava-Aktivitäten erweitern. Ich habe einen initialen Datenexport von Strava vorliegen (fast 2000 Aktivitäten). Das Ziel ist es, die volle Datenhoheit zu haben und die Aktivitäten im ersten Schritt lokal aus der `activities.csv` in eine SQLite-Datenbank zu überführen. Diese Datenbank soll dann im Next.js Frontend ausgelesen, visualisiert, gefiltert und sortiert werden.

**Randbedingungen & Anforderungen:**
1. **Keine Rohdaten im Git:** Der Ordner mit dem Strava-Export sowie ggf. sensible Datenbankdateien müssen über die `.gitignore` ausgeschlossen werden.
2. **Keine GPS/Karten-Visualisierung in Phase 1:** Wir ignorieren vorerst die FIT/GPX/TCX-Rohdaten. Wir nutzen ausschließlich die Metadaten aus der `activities.csv`.
3. **Direkt-Links:** Anstelle einer Karte soll es im Dashboard zu jeder Aktivität einen externen Link direkt zu Strava geben (`https://www.strava.com/activities/[Activity-ID]`).
4. **Zukunftssicherheit (API):** Die Architektur und das Datenbankschema sollen so aufgebaut sein, dass sie später leicht durch eine direkte Strava-API-Anbindung (für zukünftige, neue Aktivitäten) ergänzt werden können.
5. **Tech-Stack:** Das Skript zum Importieren soll idealerweise in TypeScript geschrieben sein (um Types mit Next.js zu teilen). Das Frontend nutzt Next.js (App Router), React und Tailwind CSS. Als DB-Treiber für SQLite ist `better-sqlite3` gewünscht.

---

## 🛠️ Aufgaben für die KI (Bitte Schritt für Schritt abarbeiten):

### Schritt 1: Projekt-Setup & Git-Konfiguration
- Erstelle die nötigen Einträge für die `.gitignore`, um den Strava-Rohdatenordner (z. B. `data/strava-export/`) und die SQLite-Datenbank (`strava.db`) auszuschließen.
- Nenne die benötigten NPM-Pakete, die für das Import-Skript und die Datenbankanbindung in Next.js installiert werden müssen (z. B. `better-sqlite3`, `csv-parser`, `tsx`).

### Schritt 2: Gemeinsame Types & Datenbankschema
- Definiere ein TypeScript-Interface (z.B. `StravaActivity`), das die wichtigsten Felder aus der `activities.csv` abbildet (ID, Typ, Datum, Distanz, Höhenmeter, Dauer, Name).
- Schreibe ein SQL-Schema zur Erstellung der Tabelle `activities`. Achte auf sinnvolle Datentypen (z.B. Distanz in Metern, Zeiten in Sekunden).

### Schritt 3: Das Import-Skript (TypeScript)
- Schreibe ein TypeScript-Skript für den `scripts/`-Ordner.
- Das Skript soll:
  1. Den Pfad zum Strava-Export-Ordner als Parameter oder Konstante annehmen.
  2. Die Datei `activities.csv` einlesen und parsen.
  3. Die geparsten Daten anhand des definierten Interfaces validieren/transformieren (z. B. Datumstrings in korrekte Formate umwandeln, leere Felder abfangen).
  4. Die Daten mittels Batch-Insert (für gute Performance bei ~2000 Einträgen) in die lokale SQLite-Datenbank schreiben. Upsert-Logik (`ON CONFLICT REPLACE`) ist wünschenswert, falls das Skript mehrfach läuft.

### Schritt 4: Next.js Frontend Integration (Dashboard)
- Erstelle eine Next.js Server Component, die die `strava.db` über `better-sqlite3` abfragt.
- Implementiere eine UI (mit Tailwind CSS), die die Aktivitäten auflistet.
- Baue grundlegende Client-seitige Filtermöglichkeiten ein (z. B. ein Dropdown für das Jahr "2024", "2023" und für den Typ "Ride", "Hike", "Run").
- Integriere den externen Link zur jeweiligen Aktivität auf der Strava-Website.

Bitte beginne mit Schritt 1 und frage nach, ob der Code für mich passt, bevor du zum nächsten Schritt übergehst.
