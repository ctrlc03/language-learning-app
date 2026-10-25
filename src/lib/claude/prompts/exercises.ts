import { EXERCISE_TOOL, type ExercisePlan } from '@/lib/exercises/ai-builder';
import type { Language, DifficultyLevel, VocabularyItem } from '@/types';

const LANGUAGE_NAMES: Record<Language, string> = {
  chinese: 'Mandarin Chinese',
  japanese: 'Japanese',
};

// ── Chinese: exercises written from the course ──

const SENTENCE_LENGTH: Record<DifficultyLevel, string> = {
  beginner: 'short, simple sentences of about 4 to 10 characters',
  intermediate: 'sentences of about 6 to 15 characters; two short clauses are fine',
  advanced: 'natural sentences of up to about 20 characters',
};

/** System prompt for exercises restricted to the course words taught up to `lesson`. */
export function buildCourseExerciseSystem(
  lesson: number,
  difficulty: DifficultyLevel,
  allowedWords: string,
): string {
  return `You write practice exercises in simplified Mandarin Chinese for an English-speaking learner who has studied up to lesson ${lesson} of a course.

Every Chinese word you write must come from the allowed list below. Rules:
- Characters inside an allowed word may only appear as part of that word.
- Numbers (一, 二, 十, 百, ...) are allowed.
- Do not use personal names or place names unless they are in the list. Refer to people with allowed words such as 我, 你, 他, 她, 朋友, 老师, 妈妈.
- Do not use words outside the list, even common ones.

Writing:
- Use ${SENTENCE_LENGTH[difficulty]}. Write natural, correct, everyday Chinese.
- Chinese text uses Chinese punctuation and contains no pinyin, English or numbering.
- Never write pinyin anywhere, not even in English text: the app adds it.
- Wrong options must be plausible but clearly wrong to someone who knows the answer; never a second right answer, such as one that only swaps in another meaning of the practised word.
- 他, 她 and 它 all sound tā, so a learner hearing the Chinese or reading its pinyin can't tell them apart: never make options differ only by he, she or it (him/her, his/her).

Write the exercise by calling the ${EXERCISE_TOOL} tool.

Allowed words:
${allowedWords}`;
}

function describeWord(word: VocabularyItem): string {
  return `${word.word} (${word.reading}, "${word.meaning}")`;
}

function describeTask(plan: ExercisePlan): string {
  switch (plan.type) {
    case 'multiple-choice':
      return `Write a multiple-choice question that practises the course word ${describeWord(plan.word)}. Ask whichever of these suits the word best:
- what it means (English options);
- which Chinese word has a given English meaning (Chinese options);
- its opposite, or a word that goes with it (Chinese options);
- the measure word that goes with it, when it is a noun (Chinese options);
- what to say in a short everyday situation that calls for it (Chinese options).
Give four options, one right: all in English, or all in Chinese. No two Chinese options may sound the same read aloud (not 他/她/它, not 在/再). With English options, make the wrong ones the meanings of other allowed words, and give optionsChinese: the Chinese word for each option, in the same order (${plan.word.word} for the right one).`;
    case 'sentence-mc':
      return plan.direction === 'toSentence'
        ? `Write one Chinese sentence that uses ${describeWord(plan.word)}, its English translation, and three wrong sentences: Chinese sentences close to the right one that differ in a clear detail (who, when, where, what or how many), so that only one of the four means the translation. Each must sound different read aloud: never change only 他/她/它 or another character that sounds the same.`
        : `Write one Chinese sentence that uses ${describeWord(plan.word)}, its English translation, and three wrong translations: English sentences close to the right one that differ in a clear detail (who, when, where, what or how many), so that only one of the four matches the Chinese. Give each wrong translation with the Chinese sentence it translates.`;
    case 'fill-in-blank':
      return `Write one Chinese sentence that uses ${describeWord(plan.word)}, then replace ${plan.word.word} in it with one blank, written ___. The rest of the sentence must make clear which word belongs in the blank. Give three wrong options: other allowed words, of the same kind as ${plan.word.word} where possible, that do not fit the blank.`;
    case 'sentence-construction':
      return `Write one Chinese sentence of 3 to 9 words that uses ${describeWord(plan.word)}. Cut it into tiles: its words in order, without punctuation, keeping each word whole (我们, 喜欢). List other orders of the same tiles only when they are just as correct, such as a time word before or after the subject; usually there are none.`;
    case 'grammar-drill': {
      const { rule } = plan;
      const examples = rule.examples.map((e) => `- ${e.chinese} (${e.english})`).join('\n');
      return `Practise this grammar point from the course: ${rule.title} (${rule.titleChinese}).
Pattern: ${rule.pattern}
${rule.explanation}
Examples:
${examples}

Write one new Chinese sentence that uses the pattern (not one of the examples). Replace the part of the pattern being practised, one word or a few words written together, with one blank, written ___. Give the answer and three wrong options a learner might confuse with it (similar grammar words) that do not fit, and explain in English why the answer is right.`;
    }
    case 'dialogue-comprehension':
      return `Write a short everyday conversation of 4 to 8 lines between A and B that uses ${describeWord(plan.word)}, with an English title, the same title in Chinese and a one-sentence English setting. Then ask one question in English about what is said, with four English options, one right. The answer must come from the conversation, not from common sense.`;
    case 'translation':
      return `Write one Chinese sentence that uses ${describeWord(plan.word)}, and its natural English translation.`;
  }
}

/** The request for one exercise; `problems` are what was wrong with earlier attempts. */
export function buildCourseExerciseTask(plan: ExercisePlan, problems: readonly string[]): string {
  const task = describeTask(plan);
  if (problems.length === 0) return task;
  return `${task}

Your previous attempt could not be used: ${problems.join(' ')} Write a new one that fixes this.`;
}

// ── Japanese: translation by level ──

function japaneseScriptInstruction(difficulty: DifficultyLevel): string {
  if (difficulty === 'beginner') {
    return `IMPORTANT: This is a beginner learner who cannot read kanji yet.
  - Write ALL Japanese text primarily in hiragana and katakana.
  - If you must use kanji, ALWAYS include the hiragana reading in parentheses right after it, like: 食べる(たべる)
  - Prefer writing in pure hiragana/katakana when possible. For example, write "たべる" instead of "食べる".
  - Answer options, sentences, and all exercise content must be readable without kanji knowledge.`;
  }
  if (difficulty === 'intermediate') {
    return 'Use common kanji appropriate for JLPT N4-N3 level. Include hiragana reading in parentheses after less common kanji, like: 経験(けいけん).';
  }
  return 'Use natural kanji freely. Only add readings for rare or advanced kanji.';
}

const TOPICS = [
  'greetings and introductions',
  'food and restaurants',
  'shopping and prices',
  'travel and transportation',
  'family and relationships',
  'daily routines',
  'weather and seasons',
  'hobbies and interests',
  'school and education',
  'work and occupations',
  'health and body',
  'colors and shapes',
  'animals',
  'time and dates',
  'directions and locations',
  'feelings and emotions',
  'clothing',
  'numbers and counting',
  'home and furniture',
  'nature and environment',
];

export function buildJapaneseTranslationPrompt(
  difficulty: DifficultyLevel,
  previousQuestions: readonly string[],
): string {
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  // A random seed encourages variety.
  const seed = Math.floor(Math.random() * 10000);

  let avoidClause = '';
  if (previousQuestions.length > 0) {
    const recent = previousQuestions.slice(-5);
    avoidClause = `\n\nIMPORTANT: Do NOT reuse or closely resemble any of these recent questions:\n${recent.map((q, i) => `${i + 1}. "${q}"`).join('\n')}\nGenerate something completely different.`;
  }

  return `Generate a unique translation exercise for a ${difficulty} level Japanese learner.

Topic: ${topic}
Variation seed: ${seed}

Requirements:
- The exercise must be about "${topic}" — use vocabulary and scenarios related to this topic
- Make it appropriate for ${difficulty} level
- Be creative and varied — avoid generic or overly common examples
- ${japaneseScriptInstruction(difficulty)}
- Test practical, real-world language knowledge${avoidClause}`;
}

export function buildExerciseEvaluationPrompt(
  language: Language,
  difficulty: DifficultyLevel,
): string {
  const langName = LANGUAGE_NAMES[language];

  return `You are evaluating a ${difficulty} level ${langName} learner's answer to an exercise.

Evaluate whether the answer is correct or acceptable. Consider:
- Alternative correct answers
- Minor spelling/character variations
- Acceptable paraphrasing for translation exercises

Respond with JSON:
{
  "correct": true/false,
  "feedback": "Detailed feedback explaining why the answer is correct/incorrect",
  "suggestedAnswer": "The ideal answer if the student's was wrong",
  "vocabulary": [{"word": "...", "reading": "...", "meaning": "..."}]
}`;
}
