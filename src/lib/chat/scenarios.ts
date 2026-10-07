import type { ChatScenario, Language, VocabularyItem } from '@/types';
import type { Dialogue } from '@/data/chinese/dialogues';
import { chineseDialogues } from '@/data/chinese/dialogues';
import { chineseGrammarRules } from '@/data/chinese/grammar';
import type { RolePlayContent } from '@/data/chinese/roleplays';
import { chineseRolePlays } from '@/data/chinese/roleplays';
import { getCourseVocabulary, getLessonVocabulary } from '@/data/chinese/vocabulary';

/**
 * Everything the chat can be about, keyed by id. Server-safe: the chat API resolves
 * a scenario id here and builds the system prompt itself, so no client text reaches it.
 */

export const SCENARIOS: ChatScenario[] = [
  // Chinese scenarios
  {
    id: 'zh-greetings',
    name: 'Greetings & Introductions',
    nameNative: '问候和自我介绍',
    description: 'Practice basic greetings and introducing yourself',
    language: 'chinese',
    difficulty: 'beginner',
    systemPromptAddition:
      'Focus on greetings, introductions, and basic personal information exchange. Start by greeting the student and asking their name.',
  },
  {
    id: 'zh-restaurant',
    name: 'At a Restaurant',
    nameNative: '在餐厅',
    description: 'Order food, ask about the menu, pay the bill',
    language: 'chinese',
    difficulty: 'beginner',
    systemPromptAddition:
      'Role-play as a restaurant server. Present a simple menu, take orders, and help with food-related vocabulary.',
  },
  {
    id: 'zh-shopping',
    name: 'Shopping',
    nameNative: '购物',
    description: 'Buy things, ask prices, bargain',
    language: 'chinese',
    difficulty: 'intermediate',
    systemPromptAddition:
      'Role-play as a market vendor. Help practice numbers, prices, colors, sizes, and bargaining.',
  },
  {
    id: 'zh-directions',
    name: 'Asking Directions',
    nameNative: '问路',
    description: 'Navigate a city, ask for and give directions',
    language: 'chinese',
    difficulty: 'intermediate',
    systemPromptAddition:
      'Role-play as a local person giving directions. Practice location words, transportation vocabulary, and directional phrases.',
  },
  {
    id: 'zh-travel',
    name: 'Travel & Transportation',
    nameNative: '旅行和交通',
    description: 'Book tickets, check in at hotels, plan trips',
    language: 'chinese',
    difficulty: 'intermediate',
    systemPromptAddition:
      'Help the student practice travel scenarios: booking trains/flights, checking into hotels, asking about schedules.',
  },
  {
    id: 'zh-daily',
    name: 'Daily Life',
    nameNative: '日常生活',
    description: 'Talk about your daily routine and hobbies',
    language: 'chinese',
    difficulty: 'beginner',
    systemPromptAddition:
      'Have a casual conversation about daily routines, hobbies, and lifestyle. Ask about their day and share yours.',
  },
  // Japanese scenarios
  {
    id: 'ja-greetings',
    name: 'Greetings & Introductions',
    nameNative: '挨拶と自己紹介',
    description: 'Practice basic greetings and introducing yourself',
    language: 'japanese',
    difficulty: 'beginner',
    systemPromptAddition:
      'Focus on greetings (こんにちは、はじめまして), introductions, and basic personal information. Use polite (です/ます) form.',
  },
  {
    id: 'ja-restaurant',
    name: 'At a Restaurant',
    nameNative: 'レストランで',
    description: 'Order food, ask about the menu',
    language: 'japanese',
    difficulty: 'beginner',
    systemPromptAddition:
      'Role-play as a restaurant server. Practice ordering, menu vocabulary, and polite dining expressions.',
  },
  {
    id: 'ja-shopping',
    name: 'Shopping',
    nameNative: '買い物',
    description: 'Buy things, ask about products and prices',
    language: 'japanese',
    difficulty: 'intermediate',
    systemPromptAddition:
      'Role-play as a shop clerk. Help practice shopping vocabulary, counters, prices, and polite expressions.',
  },
  {
    id: 'ja-directions',
    name: 'Asking Directions',
    nameNative: '道を聞く',
    description: 'Navigate around town, ask for directions',
    language: 'japanese',
    difficulty: 'intermediate',
    systemPromptAddition:
      'Role-play as a helpful local. Practice directions, location words, and transportation vocabulary.',
  },
  {
    id: 'ja-travel',
    name: 'Travel',
    nameNative: '旅行',
    description: 'Book accommodations, plan sightseeing',
    language: 'japanese',
    difficulty: 'intermediate',
    systemPromptAddition:
      'Help practice travel scenarios: booking ryokan/hotels, train tickets, asking about sightseeing spots.',
  },
  {
    id: 'ja-daily',
    name: 'Daily Life',
    nameNative: '日常生活',
    description: 'Chat about daily routine and interests',
    language: 'japanese',
    difficulty: 'beginner',
    systemPromptAddition:
      'Have a casual conversation about daily routines, hobbies, and interests. Use です/ます form.',
  },
];

/** Most target words and patterns a role-play asks the AI to work in. */
const MAX_TARGET_WORDS = 12;
const MAX_TARGET_PATTERNS = 6;

export interface RolePlayPattern {
  title: string;
  pattern: string;
}

/** A lesson role-play with the words and patterns it practises, computed from the lesson's data. */
export interface LessonRolePlay extends RolePlayContent {
  targetWords: VocabularyItem[];
  targetPatterns: RolePlayPattern[];
}

/** What a scenario id resolves to. */
export type ChatScenarioSpec =
  { kind: 'scenario'; scenario: ChatScenario } | { kind: 'roleplay'; rolePlay: LessonRolePlay };

const dialoguesById = new Map<string, Dialogue>(chineseDialogues.map((d) => [d.id, d]));

/** Words made only of Han characters (chips match them in the learner's messages). */
const HAN_WORD = /^\p{Script=Han}+$/u;

/**
 * The lesson's words that the scene's own dialogue uses, never padded: a scene with few
 * such words simply has few targets. Words first taught in the lesson and longer words come first.
 */
function pickTargetWords(content: RolePlayContent): VocabularyItem[] {
  const dialogue = content.dialogueId ? dialoguesById.get(content.dialogueId) : undefined;
  if (!dialogue) return [];
  const dialogueText = dialogue.lines.map((l) => l.text).join('');
  const seen = new Set<string>();
  const scored: { item: VocabularyItem; score: number }[] = [];
  for (const item of getLessonVocabulary(content.lesson)) {
    if (!HAN_WORD.test(item.word) || seen.has(item.word) || !dialogueText.includes(item.word)) {
      continue;
    }
    seen.add(item.word);
    const firstTaught = item.lessons ? Math.min(...item.lessons) === content.lesson : false;
    scored.push({ item, score: (firstTaught ? 1 : 0) + (item.word.length > 1 ? 0.5 : 0) });
  }
  // Array.sort is stable: equal scores keep the vocabulary's own order.
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_TARGET_WORDS)
    .map((s) => s.item);
}

function pickTargetPatterns(lesson: number): RolePlayPattern[] {
  const rules = chineseGrammarRules.filter((r) => r.lessons.includes(lesson));
  // Patterns first taught in this lesson come before ones it only revisits.
  const taught = rules.filter((r) => Math.min(...r.lessons) === lesson);
  const revisited = rules.filter((r) => Math.min(...r.lessons) !== lesson);
  return [...taught, ...revisited]
    .slice(0, MAX_TARGET_PATTERNS)
    .map((r) => ({ title: r.title, pattern: r.pattern }));
}

const lessonRolePlays: LessonRolePlay[] = chineseRolePlays
  .map((content) => ({
    ...content,
    targetWords: pickTargetWords(content),
    targetPatterns: pickTargetPatterns(content.lesson),
  }))
  .sort((a, b) => b.lesson - a.lesson);

/** Lesson role-plays up to `maxLesson` (all when omitted), newest lesson first. */
export function getLessonRolePlays(maxLesson?: number): LessonRolePlay[] {
  return maxLesson === undefined
    ? lessonRolePlays
    : lessonRolePlays.filter((r) => r.lesson <= maxLesson);
}

export function getRolePlay(id: string | undefined): LessonRolePlay | undefined {
  return id ? lessonRolePlays.find((r) => r.id === id) : undefined;
}

/** The lesson dialogue a role-play practises in Script mode. */
export function getRolePlayDialogue(rolePlay: RolePlayContent): Dialogue | undefined {
  return rolePlay.dialogueId ? dialoguesById.get(rolePlay.dialogueId) : undefined;
}

/** Generic scenarios offered for a language. */
export function getScenarios(language: Language): ChatScenario[] {
  return SCENARIOS.filter((s) => s.language === language);
}

/** Resolve a scenario or role-play id; undefined when unknown. */
export function findScenario(id: string): ChatScenarioSpec | undefined {
  const rolePlay = getRolePlay(id);
  if (rolePlay) return { kind: 'roleplay', rolePlay };
  const scenario = SCENARIOS.find((s) => s.id === id);
  return scenario ? { kind: 'scenario', scenario } : undefined;
}

/** The language a scenario spec belongs to. */
export function scenarioLanguage(spec: ChatScenarioSpec): Language {
  return spec.kind === 'roleplay' ? 'chinese' : spec.scenario.language;
}

/** The learner's vocabulary up to a lesson as a plain word list, for a role-play prompt. */
export function courseWordList(lesson: number): string {
  const words = new Set<string>();
  for (const v of getCourseVocabulary(lesson)) words.add(v.word);
  return [...words].join('、');
}
