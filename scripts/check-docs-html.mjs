import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Validate rendered output: multiple code examples can reuse tab names, but not DOM IDs.
const outputRoot = new URL('../dist/www/browser/', import.meta.url);
let pages = 0;
const failures = [];

async function checkDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await checkDirectory(path);
    } else if (entry.name.endsWith('.html')) {
      const html = await readFile(path, 'utf8');
      const ids = new Set();
      for (const match of html.matchAll(/<[a-z][^>]*\sid="([^"]+)"/gi)) {
        if (ids.has(match[1])) failures.push(`${path}: duplicate id "${match[1]}"`);
        ids.add(match[1]);
      }
      pages++;
    }
  }
}

await checkDirectory(fileURLToPath(outputRoot));
if (!pages) throw new Error('No built HTML pages found. Run pnpm build:www first.');
if (failures.length) throw new Error(failures.join('\n'));
console.log(`Verified unique DOM IDs across ${pages} built HTML pages.`);
