/**
 * Aggregation script:
 * - Reads all submissions/*.json
 * - Validates and normalizes each
 * - Fails if any invalid or duplicates exist
 * - Writes sorted data/contributors.json
 * - Updates README.md Wall of Fame section
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  listSubmissionFiles, readJsonSafe, normalizeContributor, validateContributor,
  sortContributors, writePrettyJson, generateWallOfFameTable
} from './lib.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const CONTRIBUTORS_PATH = path.join(repoRoot, 'data', 'contributors.json');
const README_PATH = path.join(repoRoot, 'README.md');

function betweenMarkers(md, startMarker, endMarker, replacement) {
  const start = md.indexOf(startMarker);
  const end = md.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start) {
    // Append markers if missing
    return `${md.trim()}

${startMarker}
${replacement}
${endMarker}
`;
  }
  const before = md.slice(0, start + startMarker.length);
  const after = md.slice(end);
  return `${before}
${replacement}
${after}`;
}

async function main() {
  const files = await listSubmissionFiles(repoRoot);

  const normalized = [];
  const errors = [];

  for (const f of files) {
    const data = await readJsonSafe(f);
    if (!data) {
      errors.push(`Invalid JSON in ${f}`);
      continue;
    }
    const n = normalizeContributor(data);
    const val = validateContributor(n);
    if (val.length) {
      errors.push(`${path.basename(f)}: ${val.join('; ')}`);
      continue;
    }
    // Filename must match github.json
    const expected = `${n.github}.json`;
    if (path.basename(f) !== expected) {
      errors.push(`${path.basename(f)}: filename must be ${expected}`);
      continue;
    }
    normalized.push(n);
  }

  // Duplicate detection across all submissions
  const byRoll = new Map();
  const byGh = new Map();
  for (const c of normalized) {
    if (byRoll.has(c.rollNumber)) {
      errors.push(`Duplicate rollNumber across submissions: ${c.rollNumber}`);
    } else {
      byRoll.set(c.rollNumber, c);
    }
    if (byGh.has(c.github)) {
      errors.push(`Duplicate GitHub username across submissions: ${c.github}`);
    } else {
      byGh.set(c.github, c);
    }
  }

  if (errors.length) {
    throw new Error(`Aggregation errors:\n- ${errors.join('\n- ')}`);
  }

  const sorted = sortContributors(normalized);
  await writePrettyJson(CONTRIBUTORS_PATH, sorted);

  // Update README
  let readme = await fs.readFile(README_PATH, 'utf8');
  const table = generateWallOfFameTable(sorted);
  readme = betweenMarkers(
    readme,
    '<!-- WALL_OF_FAME_START -->',
    '<!-- WALL_OF_FAME_END -->',
    table
  );
  await fs.writeFile(README_PATH, readme, 'utf8');

  console.log(`Aggregated ${sorted.length} contributors.`);
}

main().catch((e) => {
  console.error(e?.stack || String(e));
  process.exit(1);
});