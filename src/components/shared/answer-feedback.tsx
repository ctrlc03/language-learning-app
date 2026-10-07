'use client';

import type { AnswerGrade, DiffPiece } from '@/lib/language/answer';
import { cn } from '@/lib/utils';

/** Headline for a graded answer, for the caller's result panel. */
export function verdictLabel(grade: AnswerGrade): string {
  if (grade.verdict === 'correct') return 'Correct!';
  return grade.verdict === 'tones' ? 'Almost — check the tones' : 'Not quite';
}

/** Typed characters corrected against the answer: missing ones underlined, extra ones struck through. */
export function CharDiff({ diff, className }: { diff: DiffPiece[]; className?: string }) {
  return (
    <span className={cn('cjk', className)}>
      {diff.map((piece, i) => (
        <span
          key={i}
          className={cn(
            piece.kind === 'missing' && 'text-success underline decoration-2 underline-offset-4',
            piece.kind === 'extra' && 'text-destructive line-through',
          )}
        >
          {piece.text}
        </span>
      ))}
    </span>
  );
}

/**
 * What a typed answer got right and wrong: the syllables whose tone is off, the
 * characters that differ, and the answer with its pinyin. Goes under the
 * caller's own verdict headline (see verdictLabel).
 */
export function AnswerFeedback({ grade, className }: { grade: AnswerGrade; className?: string }) {
  const syllables = grade.verdict === 'tones' ? grade.syllables : undefined;
  return (
    <div className={cn('space-y-1.5 text-sm', className)}>
      {syllables && (
        <p>
          <span className="text-muted-foreground">Tones: </span>
          {syllables.map((s, i) => (
            <span key={i}>
              {i > 0 && ' '}
              <span
                className={cn(
                  !s.ok &&
                    'text-destructive font-semibold underline decoration-2 underline-offset-4',
                )}
              >
                {s.text}
              </span>
            </span>
          ))}
        </p>
      )}
      {grade.diff && (
        <p>
          <span className="text-muted-foreground">Your answer, corrected: </span>
          <CharDiff diff={grade.diff} className="text-base" />
        </p>
      )}
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="cjk text-base font-medium">{grade.answer}</span>
        {grade.answerPinyin && <span className="text-muted-foreground">{grade.answerPinyin}</span>}
      </p>
      {grade.verdict === 'correct' && grade.tonesUnchecked && (
        <p className="text-xs text-muted-foreground">
          Tones not checked — add them as marks or numbers (ni3 hao3) to have them checked.
        </p>
      )}
    </div>
  );
}
