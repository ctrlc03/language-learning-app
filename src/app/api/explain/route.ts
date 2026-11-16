import { z } from 'zod';
import {
  aiError,
  aiErrorResponse,
  getAnthropicClient,
  missingKeyResponse,
} from '@/lib/claude/client';
import { extractJsonObject } from '@/lib/claude/extract-json';
import { buildExplainPrompt } from '@/lib/claude/prompts/explain';
import { MAX_COMPOSE_LENGTH, type Explanation } from '@/lib/compose/explain';
import { chineseLessons } from '@/data/chinese/vocabulary';
import { hasHan, sentencePinyin } from '@/lib/language/pinyin';

const MODEL = 'claude-haiku-4-5-20251001';

const shippedLessons = new Set(chineseLessons.map((l) => l.lesson));

const requestSchema = z.object({
  text: z.string().trim().min(1).max(MAX_COMPOSE_LENGTH).refine(hasHan),
  lesson: z
    .number()
    .int()
    .refine((n) => shippedLessons.has(n)),
});

const replySchema = z.object({
  translation: z.string().trim().min(1),
  correct: z.boolean(),
  corrected: z.string().trim().default(''),
  notes: z.array(z.string().trim()).default([]),
});

/** The characters alone, to tell a correction from the same text re-punctuated. */
function bare(text: string): string {
  return text.replace(/[\s\p{P}]/gu, '');
}

export async function POST(request: Request) {
  const missingKey = missingKeyResponse();
  if (missingKey) return missingKey;

  try {
    const parsedBody = requestSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return aiError('Write some Chinese to explain.', 400);
    }
    const { text, lesson } = parsedBody.data;

    const response = await getAnthropicClient().messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: buildExplainPrompt(lesson),
      messages: [{ role: 'user', content: text }],
    });
    const reply = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const parsed = replySchema.safeParse(extractJsonObject(reply));
    if (!parsed.success) {
      console.error('Explain: unparseable model reply:', reply);
      return aiError('The AI reply could not be understood. Please try again.', 502);
    }

    const { translation, notes } = parsed.data;
    // Punctuation alone is no mistake, so a "correction" that only re-punctuates isn't one.
    const restated = hasHan(parsed.data.corrected) && bare(parsed.data.corrected) === bare(text);
    const correct = parsed.data.correct || restated;
    const corrected = correct || !hasHan(parsed.data.corrected) ? '' : parsed.data.corrected;
    const body: Explanation = {
      translation,
      correct,
      corrected,
      correctedPinyin: corrected ? sentencePinyin(corrected) : '',
      notes: notes.filter((note) => note !== ''),
    };
    return Response.json(body);
  } catch (error) {
    console.error('Explain error:', error);
    return aiErrorResponse(error, 'Failed to explain the text');
  }
}
