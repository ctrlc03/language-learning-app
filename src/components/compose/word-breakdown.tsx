import type { WrittenWord } from '@/lib/compose/words';

/** What was written, word by word: each word's characters, pinyin and meaning. */
export function WordBreakdown({ words }: { words: WrittenWord[] }) {
  return (
    <ol className="flex flex-wrap items-start gap-1.5">
      {words.map((word, i) => {
        if (!word.han) {
          const shown = word.text.trim();
          if (!shown) return null;
          return (
            <li
              key={i}
              aria-hidden="true"
              className="cjk px-0.5 pt-1 text-xl text-muted-foreground"
            >
              {shown}
            </li>
          );
        }
        return (
          <li key={i} className="rounded-md bg-background px-2 py-1 ring-1 ring-border">
            <span className="cjk block text-xl leading-tight" lang="zh-CN">
              {word.text}
            </span>
            <span className="block text-xs text-primary">{word.pinyin}</span>
            <span className="block max-w-[10rem] text-[11px] leading-snug text-muted-foreground">
              {word.meaning || '—'}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
