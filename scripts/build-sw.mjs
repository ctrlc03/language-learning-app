/**
 * Generates public/sw.js from public/sw.template.js, substituting the list of
 * routes to pre-cache on install.
 *
 * The list is read from NAV_TABS in src/components/layout/top-bar.tsx — the flat list
 * the nav groups are built from — so a new study mode is offline-ready the moment
 * it appears in the nav. Previously the two were maintained separately and the
 * service worker warmed 7 of 15 routes.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const NAV_FILE = join(root, 'src/components/layout/top-bar.tsx');
const TEMPLATE = join(root, 'public/sw.template.js');
const OUTPUT = join(root, 'public/sw.js');

// Routes that aren't nav tabs but must still work offline.
const EXTRA_URLS = ['/', '/session', '/session/weak', '/settings'];

const nav = readFileSync(NAV_FILE, 'utf8');
const block = nav.match(/export const NAV_TABS\s*=\s*\[([\s\S]*?)\n\];/);
if (!block) {
  throw new Error(`Could not find NAV_TABS in ${NAV_FILE} — did the nav move?`);
}

const hrefs = [...block[1].matchAll(/href:\s*'([^']+)'/g)].map((m) => m[1]);
if (hrefs.length === 0) {
  throw new Error('NAV_TABS parsed but contained no hrefs.');
}

const urls = [...new Set([...EXTRA_URLS, ...hrefs])].sort();
const template = readFileSync(TEMPLATE, 'utf8');
const output = template.replace(
  '__WARM_URLS__',
  `[\n${urls.map((u) => `  '${u}',`).join('\n')}\n]`,
);

if (output.includes('__WARM_URLS__')) {
  throw new Error('sw.template.js is missing the __WARM_URLS__ placeholder.');
}

writeFileSync(OUTPUT, output);
console.log(`sw.js generated with ${urls.length} warmed routes.`);
