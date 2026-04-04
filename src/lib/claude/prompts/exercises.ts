import type { Language, DifficultyLevel, ExerciseType } from '@/types';

const LANGUAGE_NAMES: Record<Language, string> = {
  chinese: 'Mandarin Chinese',
  japanese: 'Japanese',
};

function getScriptInstruction(language: Language, difficulty: DifficultyLevel): string {
  if (language === 'chinese') {
    return 'Use simplified Chinese characters. Include pinyin readings where relevant.';
  }
  // Japanese
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

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function buildExerciseGenerationPrompt(
  language: Language,
  difficulty: DifficultyLevel,
  exerciseType: ExerciseType,
  topic?: string,
  previousQuestions?: string[]
): string {
  const langName = LANGUAGE_NAMES[language];

  // Pick a random topic if none given
  const chosenTopic = topic || pickRandom(TOPICS, 1)[0];

  // Pick random seed to encourage variety
  const seed = Math.floor(Math.random() * 10000);

  // Build avoidance clause from previous questions
  let avoidClause = '';
  if (previousQuestions && previousQuestions.length > 0) {
    const recent = previousQuestions.slice(-5);
    avoidClause = `\n\nIMPORTANT: Do NOT reuse or closely resemble any of these recent questions:\n${recent.map((q, i) => `${i + 1}. "${q}"`).join('\n')}\nGenerate something completely different.`;
  }

  return `Generate a unique ${exerciseType.replace(/-/g, ' ')} exercise for a ${difficulty} level ${langName} learner.

Topic: ${chosenTopic}
Variation seed: ${seed}

Requirements:
- The exercise must be about "${chosenTopic}" — use vocabulary and scenarios related to this topic
- Make it appropriate for ${difficulty} level
- Be creative and varied — avoid generic or overly common examples
- ${getScriptInstruction(language, difficulty)}
- Test practical, real-world language knowledge${avoidClause}`;
}

export function buildExerciseEvaluationPrompt(
  language: Language,
  difficulty: DifficultyLevel
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
