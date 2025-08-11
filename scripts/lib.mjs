import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export async function readJsonSafe(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function normalizeContributor(raw) {
  const full = String(raw.fullName || '').trim();
  const roll = String(raw.rollNumber || '').trim();
  const gh = String(raw.github || '').trim();

  return {
    fullName: titleCase(full),
    rollNumber: roll.toLowerCase(),
    github: gh.toLowerCase()
  };
}

export function titleCase(name) {
  return name
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function validateContributor(obj) {
  const errors = [];
  if (!obj || typeof obj !== 'object') {
    errors.push('Invalid JSON: root must be an object.');
    return errors;
  }
  const { fullName, rollNumber, github } = obj;

  if (typeof fullName !== 'string' || !fullName.trim()) {
    errors.push('fullName is required and must be a non-empty string.');
  } else if (!/^[A-Za-z][A-Za-z .'\-]*[A-Za-z]$/.test(fullName.trim())) {
    errors.push('fullName may include letters, spaces, hyphens, apostrophes, and periods.');
  }

  if (typeof rollNumber !== 'string' || !/^\d{2}[A-Za-z]{3}\d{3}$/.test(rollNumber.trim())) {
    errors.push('rollNumber must match pattern like 24bca001 (2 digits + 3 letters + 3 digits).');
  }

  if (typeof github !== 'string' || !/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/.test(github.trim())) {
    errors.push('github must be a valid GitHub username.');
  }

  return errors;
}

export function sortContributors(arr) {
  return [...arr].sort((a, b) => {
    if (a.rollNumber < b.rollNumber) return -1;
    if (a.rollNumber > b.rollNumber) return 1;
    if (a.github < b.github) return -1;
    if (a.github > b.github) return 1;
    return 0;
  });
}

export function generateWallOfFameTable(contributors) {
  const rows = contributors.map((c, i) => {
    const idx = i + 1;
    const link = `https://github.com/${c.github}`;
    return `
    <tr>
      <td>${idx}</td>
      <td>${escapeHtml(c.fullName)}</td>
      <td><code>${escapeHtml(c.rollNumber)}</code></td>
      <td><a href="${link}">@${escapeHtml(c.github)}</a></td>
    </tr>`;
  }).join('');

  return `
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Full Name</th>
      <th>Roll No.</th>
      <th>GitHub</th>
    </tr>
  </thead>
  <tbody>${rows}
  </tbody>
</table>`.trim();
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export async function writePrettyJson(filePath, data) {
  const text = JSON.stringify(data, null, 2) + '\n';
  await fs.writeFile(filePath, text, 'utf8');
}

export async function listSubmissionFiles(rootDir) {
  const dir = path.join(rootDir, 'submissions');
  const items = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  return items
    .filter(d => d.isFile() && d.name.endsWith('.json'))
    .map(d => path.join(dir, d.name));
}

export function filenameForGithub(github) {
  return `submissions/${github}.json`;
}