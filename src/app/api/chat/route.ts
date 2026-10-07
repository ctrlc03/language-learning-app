import type { MessageStreamEvent } from '@anthropic-ai/sdk/resources/messages';
import {
  aiError,
  aiErrorResponse,
  describeAiError,
  getAnthropicClient,
  missingKeyResponse,
} from '@/lib/claude/client';
import { CHAT_STREAM_ERROR_MARKER } from '@/lib/claude/chat-stream';
import { buildConversationPrompt } from '@/lib/claude/prompts/conversation';
import type { Language, DifficultyLevel } from '@/types';

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
    const body = await request.json();
    const { messages, language, difficulty, scenario } = body as {
      messages: { role: 'user' | 'assistant'; content: string }[];
      language: Language;
      difficulty: DifficultyLevel;
      scenario?: string;
    };

    const client = getAnthropicClient();
    const systemPrompt = buildConversationPrompt(language, difficulty, scenario);

    const stream = client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
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
