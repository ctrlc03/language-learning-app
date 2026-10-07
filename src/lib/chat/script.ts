import type { AnswerGrade } from '@/lib/language/answer';
import { gradeAnswer } from '@/lib/language/answer';
import type { Dialogue } from '@/data/chinese/dialogues';
import type { RolePlayContent } from '@/data/chinese/roleplays';

/** One speaker of a lesson dialogue, as the learner picks it in Script mode. */
export interface ScriptRole {
  /** The speaker with any bracketed label removed: "A (Doctor)" → "A". */
  key: string;
  /** How to show it: the bracketed label ("Doctor"), else "Speaker A", else the name itself. */
  label: string;
  /** For an avatar: the label's first character, or the speaker letter (A) when those would clash. */
  initial: string;
  /** What this role says first, for telling the roles apart. */
  firstLine: DialogueLine;
}

export type DialogueLine = Dialogue['lines'][number];

export function speakerKey(speaker: string): string {
  return speaker.replace(/\s*[(（].*[)）]\s*$/, '').trim();
}

/** The roles a dialogue offers, in order of first appearance. */
export function scriptRoles(dialogue: Dialogue): ScriptRole[] {
  const roles: ScriptRole[] = [];
  for (const line of dialogue.lines) {
    const key = speakerKey(line.speaker);
    const bracket = /[(（](.*)[)）]\s*$/.exec(line.speaker)?.[1]?.trim();
    const existing = roles.find((r) => r.key === key);
    if (existing) {
      // "A" may appear unlabelled before "A (Doctor)" does.
      if (bracket && existing.label === defaultLabel(key)) existing.label = bracket;
    } else {
      roles.push({ key, label: bracket || defaultLabel(key), initial: '', firstLine: line });
    }
  }
  const firstChars = roles.map((r) => Array.from(r.label)[0] ?? '');
  roles.forEach((role, i) => {
    const clash =
      firstChars.indexOf(firstChars[i]) !== i || firstChars.lastIndexOf(firstChars[i]) !== i;
    role.initial = role.label.startsWith('Speaker ') || clash ? role.key : firstChars[i];
  });
  return roles;
}

/** The role the role-play casts the learner as, when a role's label appears in its description. */
export function likelyLearnerRole(roles: ScriptRole[], rolePlay: RolePlayContent): string | null {
  const learner = rolePlay.learnerRole.toLowerCase();
  const ai = rolePlay.aiRole.toLowerCase();
  const matches = roles.filter((r) => {
    const label = r.label.toLowerCase();
    return label.length > 1 && learner.includes(label) && !ai.includes(label);
  });
  return matches.length === 1 ? matches[0].key : null;
}

function defaultLabel(key: string): string {
  return /^[A-Za-z]$/.test(key) ? `Speaker ${key}` : key;
}

const VERDICT_RANK: Record<AnswerGrade['verdict'], number> = { correct: 0, tones: 1, wrong: 2 };

/**
 * Grade what recognition heard against a dialogue line: the transcript and its
 * alternative readings, keeping the best. Null when nothing gradable was heard.
 */
export function gradeSpoken(
  heard: { transcript: string; alternatives: string[] },
  line: DialogueLine,
): AnswerGrade | null {
  const key = { answers: [line.text], pinyin: line.pinyin };
  let best: AnswerGrade | null = null;
  for (const text of [heard.transcript, ...heard.alternatives]) {
    const grade = gradeAnswer(text, key);
    if (grade && (!best || VERDICT_RANK[grade.verdict] < VERDICT_RANK[best.verdict])) best = grade;
  }
  return best;
}
