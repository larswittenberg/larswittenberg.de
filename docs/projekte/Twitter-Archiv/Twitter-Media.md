# Twitter-Media (Vercel Blob)

Um das Vercel-Deployment-Speicherlimit (10 GB) einzuhalten, werden die Mediendateien (Bilder & MP4-Videos) des Twitter-Archivs in einen **Vercel Blob Store (Public)** ausgelagert statt im Git-Repository gebündelt.

## Vorbereitung

In `.env.local` den Lese-/Schreib-Token des Vercel Blob Stores hinterlegen:

```env
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

## Upload

`scripts/upload-to-blob.mjs` lädt alle Dateien aus `public/projekte/twitter-media/` nach `twitter-media/<datei>` in den Blob Store. Bereits vorhandene Blobs werden erkannt und übersprungen.

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

Alle Optionen: `node scripts/upload-to-blob.mjs --help`.
