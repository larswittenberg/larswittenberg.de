# Twitter Archive Processor

Dieses Projekt enthält ein Python-Script, um monatliche Markdown-Exporte von Tweets zu einer Jahresdatei zusammenzufügen und dabei unerwünschte Inhalte zu entfernen.

## Grundlage

Als Grundlage wird ein Twitter-Archiv benötigt. Dieses kann über die Twitter-Einstellungen angefordert und heruntergeladen werden. Anschließend muss das Archiv in Markdown exportiert werden: [twitter-archive-parser](https://github.com/timhutton/twitter-archive-parser).

[Artikel von Matthias Ott](https://matthiasott.com/notes/converting-your-twitter-archive-to-markdown)

## Funktion

Das Script `process_tweets.py`:

1. Liest alle `.md` Dateien aus einem angegebenen Jahresordner (z.B. `2009/`).
2. Entfernt spezifische, unerwünschte HTML-Fragmente (aktuell: `<img src="../../media/tweet.ico" width="12" />`).
3. Passt Medien-Pfade an (ersetzt `(../../media/` durch `(`, `<source src="../../media/` durch `<source src="` und `.mp4">` durch `.mp4" />`).
4. Formatiert Zeitstempel um: `[Thu Jan 01 13:50:22 +0000 2015]` wird zu `[Thu 01 Jan 2015 - 13:50:22]`.
5. Kombiniert alle Inhalte in chronologischer Reihenfolge (basierend auf den Dateinamen).
6. Speichert das Ergebnis in einer neuen Datei im Hauptverzeichnis (z.B. `tweets-2009.mdx`).

## Voraussetzungen

* Python 3 muss installiert sein.

## Benutzung

Führe das Script über die Kommandozeile aus und übergib das gewünschte Jahr als Argument:

```bash
python3 process_tweets.py <JAHR>
```

### Beispiel

Um die Tweets aus dem Ordner `2009` zu verarbeiten:

```bash
python3 process_tweets.py 2009
```

Dies liest die Dateien aus dem Ordner `2009/` und erstellt die Datei `tweets-2009.mdx`.
