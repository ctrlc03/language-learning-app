import { getAnthropicClient } from '@/lib/claude/client';
import { buildConversationPrompt } from '@/lib/claude/prompts/conversation';
import type { Language, DifficultyLevel } from '@/types';

export async function POST(request: Request) {
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

    const stream = await client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
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
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
