# Projekte – Twitter-Archiv

Seite `/projekte/tweets` mit meinen Tweets, ein MDX-Dokument pro Jahr (`/projekte/tweets/<slug>`) plus Volltextsuche.

## Datenfluss

1. Twitter-Archiv in den Twitter-Einstellungen anfordern und herunterladen.
2. Archiv mit dem [twitter-archive-parser](https://github.com/timhutton/twitter-archive-parser) nach Markdown exportieren (Hintergrund: [Artikel von Matthias Ott](https://matthiasott.com/notes/converting-your-twitter-archive-to-markdown)).
3. Monatsdateien mit `scripts/tweet-parser/process_tweets.py` zu einer Jahresdatei `tweets-<JAHR>.mdx` zusammenführen und bereinigen (Details: [scripts/tweet-parser/README.md](../../../scripts/tweet-parser/README.md)):

    ```bash
    cd scripts/tweet-parser
    python3 process_tweets.py 2009
    ```

4. Jahresdatei nach `src/app/projekte/tweets/archive/` legen und Nacharbeiten erledigen (siehe unten).
5. `yarn build:tweets` erzeugt aus allen MDX-Dateien den Suchindex `public/tweets-search.json`.
6. Medien (Bilder, Videos) zu Vercel Blob hochladen → [Twitter-Media](Twitter-Media.md).

## Nacharbeiten in den MDX-Dateien

**twitpic-URLs durch Bilder ersetzen** (RegEx-Suche in VS Code):

- Suchen: `http://twitpic\\.com/([a-z0-9]+)`
- Ersetzen: `![twitpic]($1.jpg)`

**Videos auf die MDX-Komponente `Video` umstellen:**

- `Your browser does not support the video tag.</video>` → löschen
- `<video controls><source src="` → `<Video src="`

## Relevante Dateien

| Datei | Zweck |
| ----- | ----- |
| `scripts/tweet-parser/process_tweets.py` | Monatsdateien → Jahresdatei |
| `scripts/generate-tweets-json.mjs` | Suchindex (`yarn build:tweets`) |
| `scripts/upload-to-blob.mjs` | Medien-Upload (`yarn blob:upload`) |
| `src/app/projekte/tweets/archive/*.mdx` | Tweets pro Jahr |
| `src/app/projekte/tweets/page.tsx`, `[slug]/page.tsx` | Übersicht und Jahresseiten |
| `src/components/projects/tweets/` | UI-Komponenten |
| `src/types/tweet.ts` | Typen |
| `public/tweets-search.json` | Generierter Suchindex |
