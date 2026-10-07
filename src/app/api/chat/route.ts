import type { MessageStreamEvent } from '@anthropic-ai/sdk/resources/messages';
import {
  aiError,
  aiErrorResponse,
  describeAiError,
  getAnthropicClient,
  missingKeyResponse,
} from '@/lib/claude/client';
import { CHAT_STREAM_ERROR_MARKER } from '@/lib/claude/chat-stream';
import { buildConversationPrompt, ROLE_PLAY_OPENER } from '@/lib/claude/prompts/conversation';
import { findScenario, scenarioLanguage } from '@/lib/chat/scenarios';
import { z } from 'zod';

/**
 * Everything the client sends is validated against fixed sets before it can shape the
 * system prompt: language and difficulty are enums and the scenario is an id into the
 * server-side registry, never text.
 */
/** Longest single message accepted (the chat input stops well short of it). */
const MAX_MESSAGE_CHARS = 8000;

/** Only this many recent messages go to the model; older ones stay in the stored conversation. */
const MAX_CONTEXT_MESSAGES = 100;

const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(MAX_MESSAGE_CHARS),
    }),
  ),
  language: z.enum(['chinese', 'japanese']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  scenarioId: z.string().max(64).optional(),
});

/** Next text chunk from the model, or null once the stream has ended. */
async function nextTextChunk(events: AsyncIterator<MessageStreamEvent>): Promise<string | null> {
  for (;;) {
    const { value, done } = await events.next();
    if (done) return null;
    if (value.type === 'content_block_delta' && value.delta.type === 'text_delta') {
      return value.delta.text;
    }
  }
}

export async function POST(request: Request) {
  const missingKey = missingKeyResponse();
  if (missingKey) return missingKey;

  try {
    const parsed = chatRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      const tooLong = parsed.error.issues.some((i) => i.code === 'too_big');
      return aiError(
        tooLong
          ? 'One of the messages is too long to send. Shorten it and try again.'
          : 'The chat request was not valid.',
        400,
      );
    }
    const { messages, language, difficulty, scenarioId } = parsed.data;

    const scenario = scenarioId === undefined ? undefined : findScenario(scenarioId);
    if (scenarioId !== undefined && (!scenario || scenarioLanguage(scenario) !== language)) {
      return aiError('Unknown chat scenario.', 400);
    }

    const isRolePlay = scenario?.kind === 'roleplay';
    // A conversation must end with the learner's turn, except a role-play being opened.
    if (messages.length === 0 ? !isRolePlay : messages[messages.length - 1].role !== 'user') {
      return aiError('The chat request was not valid.', 400);
    }

    // The AI speaks first in a role-play: a hidden user turn asks for the opening line.
    // It is added here on every request, never stored in the conversation or shown.
    const recent = messages.slice(-MAX_CONTEXT_MESSAGES);
    let turns = recent;
    if (recent[0]?.role !== 'user') {
      // The model needs a conversation that starts with the learner: open the role-play, or
      // drop the assistant turn a long conversation was cut at.
      turns = isRolePlay
        ? [{ role: 'user' as const, content: ROLE_PLAY_OPENER }, ...recent]
        : recent.slice(recent.findIndex((m) => m.role === 'user'));
    }

    const client = getAnthropicClient();
    const systemPrompt = buildConversationPrompt(language, difficulty, scenario);

    const stream = client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: turns,
    });
    const events = stream[Symbol.asyncIterator]();

    // Upstream failures (bad key, rate limit, outage) only surface once the stream is
    // read. Pull the first chunk before replying so they become a real HTTP status.
    const first = await nextTextChunk(events);
    if (first === null) {
      return aiError('The AI returned an empty reply. Please try again.', 502);
    }

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(first));
      },
      async pull(controller) {
        try {
          const chunk = await nextTextChunk(events);
          if (chunk === null) controller.close();
          else controller.enqueue(encoder.encode(chunk));
        } catch (error) {
          // Status is already 200: report the failure in-band for the client to surface.
          console.error('Chat stream error:', error);
          const { message } = describeAiError(error, 'The AI reply was interrupted.');
          controller.enqueue(encoder.encode(CHAT_STREAM_ERROR_MARKER + message));
          controller.close();
        }
      },
      cancel() {
        stream.abort();
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return aiErrorResponse(error, 'Failed to process chat request');
  }
}
