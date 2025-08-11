/**
 * PR validation script:
 * - Ensures the PR changes exactly one file in submissions/*.json
 * - Validates schema and formatting
 * - Checks duplicates against data/contributors.json
 * - Writes a human-readable errors file if invalid
 *
 * Usage (from workflow):
 *   node scripts/validate-pr.mjs --prDir ./pr --baseDir ./repo --changedFilesPath ./changed-files.json
 */

import fs from 'fs/promises';
import path from 'path';
import { normalizeContributor, validateContributor, readJsonSafe, filenameForGithub } from './lib.mjs';

function getArg(name, fallback = undefined) {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  return fallback;
}

async function main() {
  const prDir = getArg('prDir');
  const baseDir = getArg('baseDir');
  const changedFilesPath = getArg('changedFilesPath');

  const errorsMdPath = path.join(process.cwd(), 'validation_errors.md');

  const writeErrors = async (lines) => {
    const body = `### Validation failed

${lines.map(l => `- ${l}`).join('\n')}
`;
    await fs.writeFile(errorsMdPath, body, 'utf8');
  };

  if (!prDir || !baseDir || !changedFilesPath) {
    await writeErrors([`Internal error: missing arguments (prDir=${prDir}, baseDir=${baseDir}, changedFilesPath=${changedFilesPath})`]);
    process.exit(1);
  }

  const changedRaw = await fs.readFile(changedFilesPath, 'utf8').catch(() => '[]');
  /** @type {{filename:string,status:string}[]} */
  const changed = JSON.parse(changedRaw);

  const nonDocChanges = changed.filter(f => !f.filename.startsWith('submissions/'));
  if (nonDocChanges.length > 0) {
    await writeErrors([
      `Only files in submissions/ are allowed. Found changes outside submissions/:`,
      ...nonDocChanges.map(f => `  • ${f.filename}`)
    ]);
    process.exit(1);
  }

  const subChanges = changed.filter(f => f.filename.startsWith('submissions/') && f.filename.endsWith('.json') && f.status !== 'removed');
  if (subChanges.length !== 1) {
    await writeErrors([`PR must add or modify exactly one JSON file in submissions/. Found: ${subChanges.length}`]);
    process.exit(1);
  }

  const file = subChanges[0].filename;
  const abs = path.join(prDir, file);
  const content = await fs.readFile(abs, 'utf8').catch(() => null);
  if (content === null) {
    await writeErrors([`Unable to read file ${file}. Ensure it exists in your branch.`]);
    process.exit(1);
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    await writeErrors([`Invalid JSON in ${file}: ${e.message}`]);
    process.exit(1);
  }

  // Normalize then validate
  const normalized = normalizeContributor(parsed);
  const valErrors = validateContributor(normalized);
  if (valErrors.length) {
    await writeErrors(valErrors);
    process.exit(1);
  }

  // File name must match github
  const expected = filenameForGithub(normalized.github);
  if (file !== expected) {
    await writeErrors([`File must be named "${expected}" (currently "${file}").`]);
    process.exit(1);
  }

  // Check duplicates against existing contributors.json (base)
  const baseContribPath = path.join(baseDir, 'data', 'contributors.json');
  const existing = await readJsonSafe(baseContribPath) || [];
  const dupRoll = existing.find(e => String(e.rollNumber).toLowerCase() === normalized.rollNumber);
  const dupGithub = existing.find(e => String(e.github).toLowerCase() === normalized.github);

  const dupErrors = [];
  if (dupRoll) dupErrors.push(`Duplicate rollNumber: ${normalized.rollNumber} is already in the list.`);
  if (dupGithub) dupErrors.push(`Duplicate GitHub username: ${normalized.github} is already in the list.`);

  if (dupErrors.length) {
    await writeErrors(dupErrors);
    process.exit(1);
  }

  // Success
  console.log('Validation successful for', file);
  process.exit(0);
}

main().catch(async (e) => {
  const msg = `Unexpected error: ${e?.message || e}`;
  await fs.writeFile('validation_errors.md', `### Validation failed\n\n- ${msg}\n`, 'utf8');
  process.exit(1);
});