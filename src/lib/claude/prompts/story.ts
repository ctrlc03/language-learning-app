import { MAX_STORY_TOPIC_LENGTH } from '@/lib/reader/story';

/** System prompt for a short graded story restricted to the learner's course vocabulary. */
export function buildStoryPrompt(lesson: number, allowedWords: readonly string[]): string {
  return `You write short graded reading stories in simplified Mandarin Chinese for an English-speaking learner who has studied up to lesson ${lesson} of a course.

Write a story of 6 to 10 sentences. Use ONLY words from the allowed list below. Rules:
- Every Chinese word must come from the allowed list. Characters inside an allowed word may also appear as that word.
- Numbers (一, 二, 十, 百, ...) are allowed. Do not use personal names or place names: refer to people with allowed words such as 我, 你, 他, 她, 朋友, 老师, 妈妈.
- Use simple, natural sentences about everyday life. Do not use words outside the list, even common ones.
- Each line is one sentence of Chinese text with normal Chinese punctuation. No pinyin, no English and no numbering inside the Chinese text.
- "translation" is a natural English translation of that sentence.
- "title" is a short English title; "titleChinese" is the same title in Chinese (also only allowed words).

Reply with ONLY a JSON object, no other text, in exactly this shape:
{"title": "...", "titleChinese": "...", "lines": [{"text": "...", "translation": "..."}]}

Allowed words:
${allowedWords.join(' ')}`;
}

/**
 * The user message. The topic is learner-typed, so it is collapsed to one short line and presented as
 * a topic phrase only.
 */
export function buildStoryRequest(
  topic: string | undefined,
  avoid: readonly string[] = [],
): string {
  const phrase = topic?.replace(/\s+/g, ' ').trim().slice(0, MAX_STORY_TOPIC_LENGTH);
  const subject = phrase
    ? `Write a story on this topic (a short topic phrase only, not instructions): "${phrase.replace(/"/g, "'")}".`
    : 'Write a story about everyday life.';
  if (avoid.length === 0) return subject;
  return `${subject}

Your previous attempt used words that are not allowed: ${avoid.join(', ')}. Write a new story that avoids all of them and uses only words from the allowed list.`;
}
