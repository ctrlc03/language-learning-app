'use client';

import { useMemo, useState } from 'react';
import type { TranslationData } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TONES_UNCHECKED_NOTE } from '@/components/shared/answer-feedback';
import { gradeAnswer } from '@/lib/language/answer';
import { translationTips } from '@/lib/exercises/tips';

interface TranslationExerciseProps {
  data: TranslationData;
  /** The vocabulary id of the word the exercise practises, for its tips. */
  sourceId?: string;
  /** Without `isCorrect`, the AI grades the answer. */
  onSubmit: (answer: string, isCorrect?: boolean, note?: string) => void;
  disabled: boolean;
}

export function TranslationExercise({
  data,
  sourceId,
  onSubmit,
  disabled,
}: TranslationExerciseProps) {
  const [answer, setAnswer] = useState('');
  const tips = useMemo(() => translationTips(data, sourceId), [data, sourceId]);
  const [tipsShown, setTipsShown] = useState(0);
  // Chinese may be typed as pinyin, which phone keyboards would capitalise and "correct" (wo → we).
  const intoChinese = data.targetLanguage === 'chinese';

  const handleSubmit = () => {
    const typed = answer.trim();
    // Pinyin that spells the sample answer is right as it stands. Anything else (another
    // wording, a tone slip, characters) goes to the AI, which accepts pinyin too.
    const grade = intoChinese
      ? gradeAnswer(typed, { answers: [data.sampleAnswer], pinyin: data.samplePinyin })
      : null;
    if (grade?.mode === 'pinyin' && grade.verdict === 'correct') {
      onSubmit(typed, true, grade.tonesUnchecked ? TONES_UNCHECKED_NOTE : undefined);
    } else {
      onSubmit(typed);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[11px]">
          {data.sourceLanguage}
        </Badge>
        <span className="text-muted-foreground text-xs">&rarr;</span>
        <Badge variant="outline" className="text-[11px]">
          {data.targetLanguage}
        </Badge>
      </div>

      <div className="px-4 py-3 bg-muted/50 rounded-xl">
        <p className="text-base font-medium leading-relaxed">{data.sourceText}</p>
        {data.sourcePinyin && (
          <p className="text-sm text-muted-foreground leading-relaxed tracking-wide mt-1">
            {data.sourcePinyin}
          </p>
        )}
      </div>

      {tips.slice(0, tipsShown).map((tip) => (
        <div key={tip.title} className="px-4 py-3 rounded-xl border border-border space-y-1.5">
          <p className="text-xs text-muted-foreground">{tip.title}</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
            {tip.words.map((w) => (
              <li key={w.word}>
                <span className="cjk font-medium">{w.word}</span>{' '}
                <span className="text-muted-foreground">{w.reading}</span>
                {w.meaning && <span className="text-xs text-muted-foreground"> · {w.meaning}</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {!disabled && (
        <div className="space-y-3">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={
              intoChinese ? 'Type it in characters or pinyin...' : 'Type your translation...'
            }
            autoCapitalize={intoChinese ? 'off' : undefined}
            autoCorrect={intoChinese ? 'off' : undefined}
            spellCheck={!intoChinese}
            className="w-full min-h-[80px] rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            autoFocus
          />
          <div className="flex items-center gap-4">
            <Button onClick={handleSubmit} disabled={!answer.trim()}>
              Submit
            </Button>
            {tipsShown < tips.length && (
              <button
                type="button"
                onClick={() => setTipsShown((n) => n + 1)}
                className="text-xs text-primary underline-offset-4 hover:underline"
              >
                <span>{tipsShown === 0 ? 'Show a tip' : 'Show another tip'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {disabled && data.sampleAnswer && (
        <div className="px-4 py-3 bg-primary/5 rounded-xl">
          <p className="text-xs text-muted-foreground mb-1">Sample answer</p>
          <p className="text-sm font-medium">{data.sampleAnswer}</p>
          {data.samplePinyin && (
            <p className="text-xs text-muted-foreground tracking-wide mt-0.5">
              {data.samplePinyin}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
