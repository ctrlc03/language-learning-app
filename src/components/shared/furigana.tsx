import type { FuriSegment } from '@/types';
import { cn } from '@/lib/utils';

interface FuriganaProps {
  segments: FuriSegment[];
  className?: string;
}

/**
 * Renders Japanese text with per-kanji furigana. Segments carrying a reading
 * (`r`) are wrapped in <ruby> so the hiragana sits directly above the kanji;
 * plain segments render as normal text.
 */
export function Furigana({ segments, className }: FuriganaProps) {
  return (
    <span className={cn('leading-loose', className)}>
      {segments.map((seg, i) =>
        seg.r ? (
          <ruby key={i}>
            {seg.t}
            <rt>{seg.r}</rt>
          </ruby>
        ) : (
          <span key={i}>{seg.t}</span>
        )
      )}
    </span>
  );
}
