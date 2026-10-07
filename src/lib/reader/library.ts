/**
 * The reading library: the course's dialogues and narrator passages up to the
 * learner's current lesson, grouped by lesson (newest first), each with the
 * share of its words the course has taught so far. Everything is computed from
 * shipped data, so it works offline.
 */

import { chineseDialogues, type Dialogue } from '@/data/chinese/dialogues';
import { coverageOf, type Coverage } from '@/lib/reader/coverage';
import { getSelfCheckItems, type SelfCheckItem } from '@/lib/selfcheck/parse';
import type { DialogueLine } from '@/types';

export type ReaderTextKind = 'passage' | 'dialogue';

export interface ReaderText {
  id: string;
  title: string;
  titleChinese: string;
  setting: string;
  lesson: number;
  kind: ReaderTextKind;
  lines: DialogueLine[];
  /** Written by the AI for this session rather than shipped with the course. */
  generated?: boolean;
}

export interface ReaderEntry extends ReaderText {
  coverage: Coverage;
}

export interface ReaderLessonGroup {
  lesson: number;
  entries: ReaderEntry[];
}

/** A text is a reading passage when the narrator speaks most of its lines. */
export function kindOf(lines: readonly DialogueLine[]): ReaderTextKind {
  const narrated = lines.filter((l) => l.speaker === 'Narrator').length;
  return narrated * 2 >= lines.length ? 'passage' : 'dialogue';
}

function toReaderText(d: Dialogue): ReaderText {
  return {
    id: d.id,
    title: d.title,
    titleChinese: d.titleChinese,
    setting: d.setting,
    lesson: d.lesson,
    kind: kindOf(d.lines),
    lines: d.lines,
  };
}

const allTexts: ReaderText[] = chineseDialogues.map(toReaderText);

const groupCache = new Map<number, ReaderLessonGroup[]>();

/** Texts taught up to `currentLesson`, newest lesson first (data order within a lesson). */
export function getReaderGroups(currentLesson: number): ReaderLessonGroup[] {
  let groups = groupCache.get(currentLesson);
  if (!groups) {
    const byLesson = new Map<number, ReaderEntry[]>();
    for (const text of allTexts) {
      if (text.lesson > currentLesson) continue;
      const entry: ReaderEntry = {
        ...text,
        coverage: coverageOf(
          text.lines.map((l) => l.text),
          currentLesson,
        ),
      };
      const list = byLesson.get(text.lesson) ?? [];
      list.push(entry);
      byLesson.set(text.lesson, list);
    }
    groups = [...byLesson.entries()]
      .sort(([a], [b]) => b - a)
      .map(([lesson, entries]) => ({ lesson, entries }));
    groupCache.set(currentLesson, groups);
  }
  return groups;
}

const questionCache = new Map<string, SelfCheckItem[]>();

/** The lesson self-check questions written about a passage, in lesson order. */
export function getPassageQuestions(text: ReaderText): SelfCheckItem[] {
  if (text.generated) return [];
  let items = questionCache.get(text.title);
  if (!items) {
    items = getSelfCheckItems().filter(
      (item) => item.kind === 'passage' && item.passageTitle === text.title,
    );
    questionCache.set(text.title, items);
  }
  return items;
}
