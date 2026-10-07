'use client';

import { SpeakButton } from '@/components/shared/speak-button';
import { Button } from '@/components/ui/button';
import type { WordGloss } from '@/lib/reader/gloss';

interface GlossPanelProps {
  id: string;
  gloss: WordGloss;
  onClose: () => void;
  /** Called when the learner presses the word's speaker, before it plays. */
  onSpeak?: () => void;
}

/** The small panel under a line that explains the tapped word. */
export function GlossPanel({ id, gloss, onClose, onSpeak }: GlossPanelProps) {
  const { entry } = gloss;

  return (
    <section
      id={id}
      aria-label={`Meaning of ${gloss.word}`}
      className="mt-2 space-y-2 border border-border bg-muted/50 p-3"
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <span className="cjk text-2xl" lang="zh-CN">
              {gloss.word}
            </span>
            <span className="text-primary">{gloss.reading}</span>
          </div>
          {gloss.readingHere && (
            <p className="text-xs text-muted-foreground">In this line: {gloss.readingHere}</p>
          )}
        </div>
        <span onClickCapture={onSpeak}>
          <SpeakButton text={gloss.word} language="chinese" />
        </span>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
          <span aria-hidden="true">✕</span>
        </Button>
      </div>

      {entry ? (
        <div className="space-y-1 text-sm">
          <p>
            {entry.meaning}
            {entry.partOfSpeech && (
              <span className="text-muted-foreground"> · {entry.partOfSpeech}</span>
            )}
          </p>
          {(gloss.lesson !== undefined || gloss.core) && (
            <p className="text-xs text-muted-foreground">
              {gloss.lesson === undefined
                ? 'HSK 1 core word'
                : gloss.laterLesson && gloss.core
                  ? `HSK 1 core word · also taught in lesson ${gloss.lesson}`
                  : gloss.laterLesson
                    ? `Taught in lesson ${gloss.lesson} · you have not reached it yet`
                    : `Taught in lesson ${gloss.lesson}`}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          <p className="text-xs text-muted-foreground">Not a course word on its own.</p>
          <ul className="space-y-1.5">
            {gloss.chars.map((c, i) => (
              <li key={`${c.char}-${i}`}>
                <span className="cjk text-lg" lang="zh-CN">
                  {c.char}
                </span>{' '}
                <span className="text-primary">{c.reading}</span>
                {c.meaning && <span> · {c.meaning}</span>}
                {c.relatedWords.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Also in:{' '}
                    {c.relatedWords.map((w, j) => (
                      <span key={w.id}>
                        {j > 0 && '; '}
                        <span className="cjk" lang="zh-CN">
                          {w.word}
                        </span>{' '}
                        {w.reading} ({w.meaning})
                      </span>
                    ))}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
