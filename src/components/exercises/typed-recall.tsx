'use client';

import { useState } from 'react';
import type { TypedRecallData } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AnswerFeedback } from '@/components/shared/answer-feedback';
import { answerCore, gradeAnswer, type AnswerGrade } from '@/lib/language/answer';
import { lookupWord } from '@/lib/language/segment';

interface TypedRecallProps {
  data: TypedRecallData;
  onSubmit: (answer: string, isCorrect: boolean, note?: string) => void;
  disabled: boolean;
}

/** Say it in Chinese: the meaning is given, the learner types the word in characters or pinyin. */
export function TypedRecall({ data, onSubmit, disabled }: TypedRecallProps) {
  const [input, setInput] = useState('');
  const [grade, setGrade] = useState<AnswerGrade | null>(null);

  const key = { answers: data.answers, pinyin: data.answerPinyin };
  const gradable = gradeAnswer(input, key) !== null;

  const submit = () => {
    const result = gradeAnswer(input, key);
    if (!result) return;
    setGrade(result);
    onSubmit(
      input.trim(),
      result.verdict === 'correct',
      result.verdict === 'tones' ? 'Almost — check the tones.' : undefined,
    );
  };

  // A miss that is another course word: say what that word means, so the two get told apart.
  const typedCore = answerCore(input);
  const otherWord =
    grade?.verdict === 'wrong' && grade.mode === 'hanzi' ? lookupWord(typedCore) : undefined;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xl font-semibold leading-snug">{data.prompt}</p>
        {data.hint && <p className="text-xs text-muted-foreground">{data.hint}</p>}
      </div>

      {!disabled && (
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && gradable && submit()}
            placeholder="Characters or pinyin"
            aria-label="Your answer in Chinese"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            autoFocus
            className="cjk text-base"
          />
          <Button onClick={submit} disabled={!gradable}>
            Check
          </Button>
        </div>
      )}

      {disabled && grade && (
        <div className="space-y-2">
          <p className="text-sm">
            <span className="text-muted-foreground">You typed: </span>
            <span className="cjk">{input.trim()}</span>
          </p>
          <AnswerFeedback grade={grade} />
          {otherWord && (
            <p className="text-xs text-muted-foreground">
              <span className="cjk">{otherWord.word}</span> ({otherWord.reading}) means “
              {otherWord.meaning}”.
            </p>
          )}
          {data.note && (
            <p className="text-xs text-muted-foreground whitespace-pre-line">{data.note}</p>
          )}
        </div>
      )}
    </div>
  );
}
