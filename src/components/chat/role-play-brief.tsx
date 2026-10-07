'use client';

import { useMemo } from 'react';
import type { ChatMessage } from '@/types';
import { Button } from '@/components/ui/button';
import type { LessonRolePlay } from '@/lib/chat/scenarios';
import { cn } from '@/lib/utils';

interface RolePlayBriefProps {
  rolePlay: LessonRolePlay;
  messages: ChatMessage[];
  /** Indexes of the goals the learner has ticked. */
  goalsDone: number[];
  onToggleGoal: (index: number) => void;
  /** Opens Script mode (the lesson dialogue, offline). Omitted when the role-play has none. */
  onScript?: () => void;
  goalsDisabled?: boolean;
}

/** A compact card above the messages: the scene, your role, goals to tick and target words. */
export function RolePlayBrief({
  rolePlay,
  messages,
  goalsDone,
  onToggleGoal,
  onScript,
  goalsDisabled,
}: RolePlayBriefProps) {
  // A word lights up once one of the learner's own messages contains it.
  const used = useMemo(() => {
    const said = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join('\n');
    return new Set(rolePlay.targetWords.filter((w) => said.includes(w.word)).map((w) => w.word));
  }, [messages, rolePlay.targetWords]);

  const done = new Set(goalsDone);

  return (
    <details open className="group border-b border-border bg-card">
      <summary className="flex cursor-pointer items-center justify-between gap-2 px-4 py-2 text-sm">
        <span className="min-w-0 truncate">
          <span className="font-medium">{rolePlay.title}</span>
          <span className="cjk text-primary"> · {rolePlay.titleChinese}</span>
          <span className="text-muted-foreground"> · Lesson {rolePlay.lesson}</span>
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {done.size}/{rolePlay.goals.length} goals
        </span>
      </summary>

      <div className="max-h-[40vh] space-y-3 overflow-y-auto px-4 pb-3 text-sm">
        <p>
          {rolePlay.setting}{' '}
          <span className="text-muted-foreground">
            You are {rolePlay.learnerRole}; the AI is {rolePlay.aiRole}.
          </span>
        </p>

        <fieldset>
          <legend className="mb-1 text-xs font-medium tracking-[0.1em] text-muted-foreground">
            GOALS
          </legend>
          <ul className="space-y-1">
            {rolePlay.goals.map((goal, i) => (
              <li key={goal}>
                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    checked={done.has(i)}
                    disabled={goalsDisabled}
                    onChange={() => onToggleGoal(i)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                  />
                  <span className={cn(done.has(i) && 'text-muted-foreground line-through')}>
                    {goal}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        {rolePlay.targetWords.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-medium tracking-[0.1em] text-muted-foreground">
              TRY TO USE
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {rolePlay.targetWords.map((w) => {
                const lit = used.has(w.word);
                return (
                  <li
                    key={w.word}
                    title={`${w.reading} · ${w.meaning}`}
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-xs transition-colors',
                      lit
                        ? 'border-success/40 bg-success/10 text-success'
                        : 'border-border bg-muted text-muted-foreground',
                    )}
                  >
                    <span className="cjk">{w.word}</span>
                    <span className="ml-1 text-[10px]">{w.reading}</span>
                    {lit && <span className="sr-only"> (used)</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {onScript && (
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onScript}>
              Script mode
            </Button>
            <span className="text-xs text-muted-foreground">
              Practise the lesson dialogue line by line, no AI or network needed.
            </span>
          </div>
        )}
      </div>
    </details>
  );
}
