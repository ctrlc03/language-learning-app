import type Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import {
  aiError,
  aiErrorResponse,
  getAnthropicClient,
  missingKeyResponse,
} from '@/lib/claude/client';
import { extractJsonObject } from '@/lib/claude/extract-json';
import { buildStoryPrompt, buildStoryRequest } from '@/lib/claude/prompts/story';
import { chineseLessons, getCourseVocabulary } from '@/data/chinese/vocabulary';
import { hasHan, toPinyin } from '@/lib/language/pinyin';
import { findUnknown, type UnknownReport } from '@/lib/reader/coverage';
import {
  MAX_STORY_TOPIC_LENGTH,
  MAX_UNKNOWN_SHARE,
  type GeneratedStory,
  type StoryResponse,
} from '@/lib/reader/story';

const MODEL = 'claude-haiku-4-5-20251001';

const shippedLessons = new Set(chineseLessons.map((l) => l.lesson));

const requestSchema = z.object({
  lesson: z
    .number()
    .int()
    .refine((n) => shippedLessons.has(n), { message: 'Unknown lesson' }),
  topic: z.string().trim().max(MAX_STORY_TOPIC_LENGTH).optional(),
});

const storySchema = z.object({
  title: z.string().trim().min(1),
  titleChinese: z.string().trim().min(1),
  lines: z
    .array(z.object({ text: z.string().trim(), translation: z.string().trim().default('') }))
    .min(1),
});

interface Attempt {
  story: GeneratedStory;
  report: UnknownReport;
}

/** One model call: a parsed story with its unknown-word report, or null when the reply is unusable. */
async function attemptStory(
  client: Anthropic,
  system: string,
  lesson: number,
  topic: string | undefined,
  avoid: readonly string[],
): Promise<Attempt | null> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system,
    messages: [{ role: 'user', content: buildStoryRequest(topic, avoid) }],
  });
  const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
  const parsed = storySchema.safeParse(extractJsonObject(text));
  if (!parsed.success) {
    console.error('Story: unparseable model reply:', text);
    return null;
  }
  const lines = parsed.data.lines
    .filter((l) => hasHan(l.text))
    .map((l) => ({ text: l.text, pinyin: toPinyin(l.text), translation: l.translation }));
  if (lines.length < 3) {
    console.error('Story: too few lines in model reply:', text);
    return null;
  }
  return {
    story: { title: parsed.data.title, titleChinese: parsed.data.titleChinese, lines },
    report: findUnknown(
      lines.map((l) => l.text),
      lesson,
    ),
  };
}

function unknownShare(report: UnknownReport): number {
  return report.total === 0 ? 0 : report.unknown / report.total;
}

export async function POST(request: Request) {
  const missingKey = missingKeyResponse();
  if (missingKey) return missingKey;

  try {
    const parsedBody = requestSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return aiError('That story request was not valid.', 400);
    }
    const { lesson, topic } = parsedBody.data;

    const allowed = [...new Set(getCourseVocabulary(lesson).map((v) => v.word))];
    const system = buildStoryPrompt(lesson, allowed);
    const client = getAnthropicClient();

    const first = await attemptStory(client, system, lesson, topic, []);
    let best = first;
    if (first && unknownShare(first.report) > MAX_UNKNOWN_SHARE) {
      try {
        const retry = await attemptStory(client, system, lesson, topic, first.report.words);
        if (retry && unknownShare(retry.report) < unknownShare(first.report)) best = retry;
      } catch (retryError) {
        // The first story is still usable; keep it rather than failing the request.
        console.error('Story retry failed:', retryError);
      }
    }

    if (!best) {
      return aiError('The AI reply could not be understood. Please try again.', 502);
    }
    const body: StoryResponse = { story: best.story, unknownWords: best.report.words };
    return Response.json(body);
  } catch (error) {
    console.error('Story error:', error);
    return aiErrorResponse(error, 'Failed to write a story');
  }
}
