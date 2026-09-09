/* eslint-disable */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { put, list } from '@vercel/blob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 1. Load .env.local if BLOB_READ_WRITE_TOKEN is not in process.env
function loadEnvLocal() {
	if (process.env.BLOB_READ_WRITE_TOKEN) return;

	const envLocalPath = path.join(projectRoot, '.env.local');
	if (fs.existsSync(envLocalPath)) {
		const content = fs.readFileSync(envLocalPath, 'utf-8');
		for (const line of content.split('\n')) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith('#')) continue;
			const match = trimmed.match(/^([A-Za-z0-9_]+)=(.*)$/);
			if (match) {
				const key = match[1];
				let value = match[2].trim();
				if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
					value = value.slice(1, -1);
				}
				process.env[key] = value;
			}
		}
	}
}

loadEnvLocal();

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
	console.error('❌ Fehler: BLOB_READ_WRITE_TOKEN wurde weder im Environment noch in .env.local gefunden.');
	process.exit(1);
}

// 2. Parse command line arguments
// Supports: --limit=5, --limit 5, -n 5, --force, --concurrency=3
const args = process.argv.slice(2);
let limit = Infinity;
let forceOverwrite = false;
let concurrency = 3;

for (let i = 0; i < args.length; i++) {
	const arg = args[i];
	if (arg.startsWith('--limit=')) {
		limit = parseInt(arg.split('=')[1], 10);
	} else if (arg === '--limit' || arg === '-n') {
		limit = parseInt(args[++i], 10);
	} else if (arg === '--force' || arg === '--no-skip-existing') {
		forceOverwrite = true;
	} else if (arg.startsWith('--concurrency=')) {
		concurrency = parseInt(arg.split('=')[1], 10);
	} else if (arg === '--concurrency') {
		concurrency = parseInt(args[++i], 10);
	} else if (arg === '--help' || arg === '-h') {
		console.log(`
Verwendung:
  node scripts/upload-to-blob.mjs [Optionen]

Optionen:
  --limit, -n <Zahl>      Maximale Anzahl an Dateien, die hochgeladen werden sollen (z. B. --limit 5)
  --concurrency <Zahl>    Gleichzeitige Uploads (Standard: 3)
  --force                 Bereits auf Vercel Blob vorhandene Dateien überschreiben (Standard: überspringen)
  -h, --help              Diese Hilfe anzeigen
`);
		process.exit(0);
	}
}

const MEDIA_DIR = path.join(projectRoot, 'public/projekte/twitter-media');

if (!fs.existsSync(MEDIA_DIR)) {
	console.error(`❌ Verzeichnis nicht gefunden: ${MEDIA_DIR}`);
	process.exit(1);
}

async function getExistingBlobs() {
	console.log('🔍 Prüfe bereits vorhandene Dateien in Vercel Blob...');
	const existingPathnames = new Set();
	let cursor;
	let hasMore = true;

	try {
		while (hasMore) {
			const result = await list({
				prefix: 'twitter-media/',
				cursor,
				limit: 1000,
				token,
			});

			for (const blob of result.blobs) {
				existingPathnames.add(blob.pathname);
			}

			hasMore = result.hasMore;
			cursor = result.cursor;
		}
		console.log(`ℹ️  Bereits ${existingPathnames.size} Datei(en) im Blob Storage gefunden.`);
	} catch (err) {
		console.warn('⚠️  Konnte vorhandene Blobs nicht abrufen (wird fortgesetzt):', err.message);
	}

	return existingPathnames;
}

async function main() {
	console.log('🚀 Starte Vercel Blob Upload-Vorbereitung...');
	console.log(`📁 Quellverzeichnis: ${MEDIA_DIR}`);
	if (limit !== Infinity) {
		console.log(`🎯 Test-Modus aktiv: Limit auf ${limit} Datei(en) gesetzt.`);
	}

	// Read local directory
	const allFiles = fs
		.readdirSync(MEDIA_DIR)
		.filter((name) => !name.startsWith('.') && fs.statSync(path.join(MEDIA_DIR, name)).isFile());

	console.log(`📦 Gefundene lokale Mediendateien: ${allFiles.length}`);

	// Fetch existing files unless --force is set
	const existingBlobs = forceOverwrite ? new Set() : await getExistingBlobs();

	// Filter files to upload
	const filesToUpload = [];
	let skippedCount = 0;

	for (const fileName of allFiles) {
		const blobPathname = `twitter-media/${fileName}`;
		if (!forceOverwrite && existingBlobs.has(blobPathname)) {
			skippedCount++;
			continue;
		}
		filesToUpload.push(fileName);
		if (filesToUpload.length >= limit) {
			break;
		}
	}

	if (skippedCount > 0 && !forceOverwrite) {
		console.log(`⏭️  ${skippedCount} bereits hochgeladene Datei(en) werden übersprungen.`);
	}

	if (filesToUpload.length === 0) {
		console.log('✅ Keine neuen Dateien zum Hochladen vorhanden.');
		return;
	}

	console.log(`\n⬆️  Lade ${filesToUpload.length} Datei(en) hoch (Parallelität: ${concurrency})...\n`);

	let completedCount = 0;
	let successCount = 0;
	const failedFiles = [];
	const uploadedUrls = [];

	// Worker queue for concurrency
	let fileIndex = 0;
	async function worker() {
		while (fileIndex < filesToUpload.length) {
			const currentIndex = fileIndex++;
			const fileName = filesToUpload[currentIndex];
			const filePath = path.join(MEDIA_DIR, fileName);
			const blobPathname = `twitter-media/${fileName}`;
			const fileSizeMB = (fs.statSync(filePath).size / (1024 * 1024)).toFixed(2);

			let attempts = 0;
			const maxAttempts = 3;
			let lastError = null;
			let uploadSuccess = false;

			while (attempts < maxAttempts && !uploadSuccess) {
				attempts++;
				try {
					const fileStream = fs.createReadStream(filePath);
					const blob = await put(blobPathname, fileStream, {
						access: 'public',
						addRandomSuffix: false,
						token,
					});

					completedCount++;
					successCount++;
					uploadSuccess = true;
					uploadedUrls.push({ fileName, url: blob.url });
					console.log(
						`[${completedCount}/${filesToUpload.length}] ✅ (${fileSizeMB} MB) ${blobPathname} -> ${blob.url}`,
					);
				} catch (err) {
					lastError = err;
					if (attempts < maxAttempts) {
						// Kurze Pause vor Retry (1 Sekunde)
						await new Promise((resolve) => setTimeout(resolve, 1000));
					}
				}
			}

			if (!uploadSuccess) {
				completedCount++;
				failedFiles.push({ fileName, error: lastError?.message || 'Unbekannter Fehler', sizeMB: fileSizeMB });
				console.error(
					`[${completedCount}/${filesToUpload.length}] ❌ Fehler bei ${fileName} (${fileSizeMB} MB):`,
					lastError?.message,
				);
			}
		}
	}

	const workers = Array.from({ length: Math.min(concurrency, filesToUpload.length) }, () => worker());
	await Promise.all(workers);

	console.log('\n========================================');
	console.log(`🏁 Upload abgeschlossen!`);
	console.log(`   Erfolgreich: ${successCount}`);
	if (failedFiles.length > 0) {
		console.log(`   Fehlgeschlagen: ${failedFiles.length}`);
		console.log('\n❌ Details zu den fehlgeschlagenen Dateien:');
		for (const fail of failedFiles) {
			console.log(`   • ${fail.fileName} (${fail.sizeMB} MB): ${fail.error}`);
		}

		// Fehler-Logdatei schreiben
		const logPath = path.join(projectRoot, 'upload-errors.log');
		const logContent = failedFiles
			.map((f) => `${new Date().toISOString()} | ${f.fileName} (${f.sizeMB} MB) | ${f.error}`)
			.join('\n');
		fs.writeFileSync(logPath, logContent + '\n', 'utf-8');
		console.log(`\n📄 Details wurden gespeichert in: ${logPath}`);
	}
	console.log('========================================\n');

	if (uploadedUrls.length > 0) {
		console.log('🔗 Beispiel-URLs zum Testen im Browser:');
		for (const item of uploadedUrls.slice(0, 5)) {
			console.log(`   • ${item.url}`);
		}
		console.log('');
	}
}

main().catch((err) => {
	console.error('Unerwarteter Fehler im Upload-Skript:', err);
	process.exit(1);
});
