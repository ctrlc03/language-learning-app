/**
 * Generates component-decomposition data for the characters referenced in the
 * Chinese content, so the writing practice can show how each character breaks
 * down (妈 = 女 woman + 马 horse). Uses the `hanzi` library (make-me-a-hanzi
 * data) at build time and writes a compact JSON served from public/.
 *
 * Output shape:
 *   { chars: { "妈": { components: [{ c: "女", m: "woman" }, ...] } },
 *     byComponent: { "女": ["妈", "好", ...] } }   // restricted to our set
 *
 * Run via `npm run build:hanzi-decomp`.
 */
import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const hanzi = require('hanzi');
hanzi.start();

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIRS = [
  join(root, 'src/data/chinese'),
  join(root, 'src/lib/tones'),
  join(root, 'src/lib/measure-words'),
];
const OUT_DIR = join(root, 'public');
const OUT_FILE = join(OUT_DIR, 'hanzi-decomp.json');

const HAN_RE = /\p{Script=Han}/gu;

// Gather every unique Han character referenced in the content.
const chars = new Set();
for (const dir of SRC_DIRS) {
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir)) {
    if (!/\.(ts|json)$/.test(file)) continue;
    for (const m of readFileSync(join(dir, file), 'utf8').matchAll(HAN_RE)) chars.add(m[0]);
  }
}

/** Short meaning for a component, or null if we can't gloss it. */
function componentMeaning(comp) {
  const rad = hanzi.getRadicalMeaning(comp);
  if (rad) return rad;
  const def = hanzi.definitionLookup(comp);
  if (def && def[0]?.definition) {
    return def[0].definition.split('/')[0].trim();
  }
  return null;
}

const charsOut = {};
const byComponent = {};

for (const char of chars) {
  let result;
  try {
    result = hanzi.decompose(char);
  } catch {
    continue;
  }
  const raw = result?.components1 ?? [];
  const seen = new Set();
  const components = [];
  for (const comp of raw) {
    if (comp === char || comp === 'No glyph available' || seen.has(comp)) continue;
    if ([...comp].length !== 1) continue; // skip multi-codepoint fragments
    const m = componentMeaning(comp);
    if (!m) continue; // only keep components we can actually explain
    seen.add(comp);
    components.push({ c: comp, m });
  }
  if (components.length < 2) continue; // atomic char — nothing useful to show
  charsOut[char] = { components };
  for (const { c } of components) {
    (byComponent[c] ??= []).push(char);
  }
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify({ chars: charsOut, byComponent }));

console.log(
  `hanzi-decomp: ${Object.keys(charsOut).length} decomposable characters, ` +
    `${Object.keys(byComponent).length} components, from ${chars.size} referenced.`,
);
