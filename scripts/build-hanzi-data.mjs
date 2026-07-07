/**
 * Copies stroke-order data for only the Han characters referenced anywhere in
 * the Chinese content into public/hanzi-data/, so the writing practice works
 * fully offline without hitting a CDN. Run via `npm run build:hanzi-data`.
 */
import { readdirSync, readFileSync, existsSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIRS = [join(root, 'src/data/chinese'), join(root, 'src/lib/tones')];
const DATA_PKG = join(root, 'node_modules/hanzi-writer-data');
const OUT_DIR = join(root, 'public/hanzi-data');

const HAN_RE = /\p{Script=Han}/gu;

// Gather every unique Han character referenced in the content files.
const chars = new Set();
for (const dir of SRC_DIRS) {
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir)) {
    if (!/\.(ts|json)$/.test(file)) continue;
    const text = readFileSync(join(dir, file), 'utf8');
    for (const m of text.matchAll(HAN_RE)) chars.add(m[0]);
  }
}

mkdirSync(OUT_DIR, { recursive: true });

let copied = 0;
let missing = 0;
const available = [];
for (const char of chars) {
  const srcFile = join(DATA_PKG, `${char}.json`);
  if (!existsSync(srcFile)) {
    missing++;
    continue;
  }
  copyFileSync(srcFile, join(OUT_DIR, `${char}.json`));
  available.push(char);
  copied++;
}

// Manifest of which characters have stroke data (used to filter the study list).
writeFileSync(join(OUT_DIR, 'index.json'), JSON.stringify(available));

console.log(
  `hanzi-data: ${copied} characters copied, ${missing} without stroke data, from ${chars.size} referenced.`,
);
