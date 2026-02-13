/* eslint-disable */
import fs from 'fs';
import path from 'path';

const ARCHIVE_DIR = path.join(process.cwd(), 'src/app/projekte/tweets/archive');
const OUTPUT_FILE = path.join(process.cwd(), 'public/tweets-search.json');

async function generateTweetsJson() {
  console.log('Generating tweets JSON...');

  if (!fs.existsSync(ARCHIVE_DIR)) {
      console.error(`Directory not found: ${ARCHIVE_DIR}`);
      return;
  }

  const files = fs.readdirSync(ARCHIVE_DIR)
      .filter(file => file.endsWith('.mdx'))
      .map(file => path.join(ARCHIVE_DIR, file));

  const allTweets = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    // Split by the separator used in the MDX files
    // The separator is a blank line, 4 dashes, blank line.
    // We use a regex to split.
    const blocks = content.split(/\n\s*----\s*\n/);

    for (const block of blocks) {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) continue;

      // Extract date and link (usually at the end)
      // Format: [Date](Url)
      // Regex to find the last occurrence of this pattern
      const dateLinkRegex = /\[([^\]]+)\]\((https?:\/\/twitter\.com\/[^)]+)\)$/;
      const match = trimmedBlock.match(dateLinkRegex);

      if (match) {
        const dateString = match[1]; // e.g., "Fri 01 Jan 2016 - 21:52:33"
        const url = match[2];
        // Extract ID from URL
        const idMatch = url.match(/\/status\/(\d+)/);
        const id = idMatch ? idMatch[1] : null;

        if (id) {
            // Remove the date link from the content for cleaner display/search
            const contentWithoutDate = trimmedBlock.replace(dateLinkRegex, '').trim();

            allTweets.push({
                id,
                date: dateString,
                url,
                content: contentWithoutDate,
                // Simple search index: lowercase content
                search_text: contentWithoutDate.toLowerCase()
            });
        }
      }
    }
  }

  // Sort by date (descending)
  allTweets.sort((a, b) => {
      const dateA = new Date(parseDate(a.date));
      const dateB = new Date(parseDate(b.date));
      return dateB - dateA;
  });

  console.log(`Found ${allTweets.length} tweets.`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allTweets, null, 2));
  console.log(`Written to ${OUTPUT_FILE}`);
}

function parseDate(dateStr) {
    // "Fri 01 Jan 2016 - 21:52:33"
    // Remove day name
    const parts = dateStr.split(' ');
    // parts: ["Fri", "01", "Jan", "2016", "-", "21:52:33"]
    if (parts.length >= 6) {
        const monthMap = {
            Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
            Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
        };
        const day = parts[1];
        const month = monthMap[parts[2]];
        const year = parts[3];
        const time = parts[5];
        return `${year}-${month}-${day}T${time}`;
    }
    return new Date().toISOString(); // Fallback
}

generateTweetsJson();
