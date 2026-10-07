'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpeakButton } from '@/components/shared/speak-button';
import { SelfCheckPractice } from '@/components/selfcheck/self-check-practice';
import { getSelfCheckItems } from '@/lib/selfcheck/parse';
import type { SelfCheckItem, SelfCheckKind } from '@/lib/selfcheck/parse';
import type { LessonEntry, LessonNote } from '@/data/chinese/vocabulary';

/**
 * Reader for a lesson's written notes — the prose that used to live only in the
 * source markdown while lessons.json kept just the word list. Sections carry
 * optional worked examples (speakable) and comparison tables, and the lesson's
 * self-check questions can be practised right here: built, filled in, chosen
 * or spoken, graded, and fed into the mistake notebook.
 */
export function LessonNotes({ lesson, onExit }: { lesson: LessonEntry; onExit: () => void }) {
  return (
    <div className="p-5 md:p-8 max-w-xl mx-auto space-y-5">
      <Button variant="ghost" size="sm" onClick={onExit}>
        &larr; All lessons
      </Button>

      <div>
        <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
          Lesson {lesson.lesson}
        </div>
        <h1 className="text-xl font-bold tracking-tight">
          {lesson.titleChinese}
          <span className="text-muted-foreground font-normal text-base ml-2">{lesson.title}</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {lesson.vocabulary.length} words · {lesson.notes?.length ?? 0} sections
        </p>
      </div>

      {lesson.notes?.map((note, i) => (
        <NoteSection key={i} note={note} />
      ))}

      <SelfCheckSection lessonNumber={lesson.lesson} />
    </div>
  );
}

function NoteSection({ note }: { note: LessonNote }) {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <h2 className="font-semibold text-sm">{note.heading}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{note.body}</p>

        {note.examples && (
          <div className="space-y-2">
            {note.examples.map((ex, i) => (
              <div key={i} className="bg-muted/50 rounded-lg px-3 py-2 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{ex.chinese}</p>
                  <SpeakButton text={ex.chinese} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground">{ex.pinyin}</p>
                <p className="text-xs">{ex.english}</p>
              </div>
            ))}
          </div>
        )}

        {note.table && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  {note.table.headers.map((h, i) => (
                    <th
                      key={i}
                      className="text-left font-semibold py-1.5 pr-3 border-b border-border"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {note.table.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="py-1.5 pr-3 align-top border-b border-border/40 text-muted-foreground"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Groups of question kinds for the summary line, in display order. */
const KIND_GROUPS: { label: string; kinds: SelfCheckKind[] }[] = [
  { label: 'to build', kinds: ['order'] },
  { label: 'to fill in', kinds: ['blank', 'insert'] },
  { label: 'to choose', kinds: ['choice', 'passage', 'choose-reply'] },
  { label: 'to say', kinds: ['translate', 'reply', 'open'] },
  { label: 'to rewrite', kinds: ['correct', 'opposite'] },
  { label: 'to explain', kinds: ['explain'] },
];

function kindsSummary(items: SelfCheckItem[]): string {
  return KIND_GROUPS.map(({ label, kinds }) => {
    const n = items.filter((item) => kinds.includes(item.kind)).length;
    return n > 0 ? `${n} ${label}` : null;
  })
    .filter(Boolean)
    .join(', ');
}

function SelfCheckSection({ lessonNumber }: { lessonNumber: number }) {
  const items = useMemo(() => getSelfCheckItems({ lesson: lessonNumber }), [lessonNumber]);
  const [started, setStarted] = useState(false);

  if (items.length === 0) return null;

  if (started) {
    return (
      <section className="space-y-3">
        <h2 className="font-semibold text-sm">Self-check</h2>
        <SelfCheckPractice items={items} source="lesson" />
      </section>
    );
  }

  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-sm">Self-check</h2>
          <Badge variant="outline" className="text-[9px]">
            {items.length} questions
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{kindsSummary(items)}</p>
        <Button onClick={() => setStarted(true)}>Start</Button>
      </CardContent>
    </Card>
  );
}
