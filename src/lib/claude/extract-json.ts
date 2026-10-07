/**
 * Pull the first balanced JSON object out of free model text.
 *
 * Models wrap JSON in ```json fences or surround it with prose. We scan for each
 * `{`, walk to its matching `}` (respecting strings and escapes) and return the
 * first candidate that parses. Returns undefined when no object parses.
 */
export function extractJsonObject(text: string): unknown {
  for (let start = text.indexOf('{'); start !== -1; start = text.indexOf('{', start + 1)) {
    const end = findObjectEnd(text, start);
    if (end === -1) continue;
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      // Not valid JSON from this brace; try the next one.
    }
  }
  return undefined;
}

/** Index of the `}` matching the `{` at `start`, or -1 when unbalanced. */
function findObjectEnd(text: string, start: number): number {
  let depth = 0;
  let inString = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (ch === '\\') i++;
      else if (ch === '"') inString = false;
    } else if (ch === '"') {
      inString = true;
    } else if (ch === '{') {
      depth++;
    } else if (ch === '}' && --depth === 0) {
      return i;
    }
  }
  return -1;
}
