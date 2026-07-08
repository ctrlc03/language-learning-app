/**
 * Loads the self-hosted character-decomposition data (built by
 * scripts/build-hanzi-decomp.mjs) once and caches it.
 */

export interface DecompComponent {
  c: string; // component character
  m: string; // short meaning
}

export interface DecompData {
  chars: Record<string, { components: DecompComponent[] }>;
  byComponent: Record<string, string[]>;
}

let cache: Promise<DecompData | null> | null = null;

export function loadDecomp(): Promise<DecompData | null> {
  if (!cache) {
    cache = fetch('/hanzi-decomp.json')
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }
  return cache;
}

/** Strip tone marks so pinyin can be compared phonetically (mǎ → ma). */
export function toneless(pinyin: string): string {
  return pinyin.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
