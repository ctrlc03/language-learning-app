import { getAnthropicClient } from '@/lib/claude/client';
import type { Language, DifficultyLevel } from '@/types';

const FLASHCARD_TOOL = {
  name: 'create_flashcards' as const,
  description: 'Create vocabulary flashcards',
  input_schema: {
    type: 'object' as const,
    properties: {
      cards: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            front: { type: 'string' as const, description: 'The word or phrase in the target language' },
            back: { type: 'string' as const, description: 'English translation' },
            reading: { type: 'string' as const, description: 'Pinyin or hiragana reading' },
            exampleSentence: { type: 'string' as const },
            exampleTranslation: { type: 'string' as const },
          },
          required: ['front', 'back', 'reading'],
        },
      },
    },
    required: ['cards'],
  },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { language, difficulty, topic, count = 10 } = body as {
      language: Language;
      difficulty: DifficultyLevel;
      topic?: string;
      count?: number;
    };

    const langName = language === 'chinese' ? 'Mandarin Chinese' : 'Japanese';
    const client = getAnthropicClient();

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      tools: [FLASHCARD_TOOL],
      tool_choice: { type: 'tool', name: 'create_flashcards' },
      messages: [
        {
          role: 'user',
          content: `Generate ${count} ${difficulty} level ${langName} vocabulary flashcards${topic ? ` about "${topic}"` : ''}. Include pinyin/furigana readings, example sentences, and translations.${
            language === 'japanese' && difficulty === 'beginner'
              ? '\n\nIMPORTANT: This is a beginner who cannot read kanji. Write the "front" field in hiragana (e.g. "たべる" not "食べる"). Example sentences should also be in hiragana/katakana, with kanji in parentheses only if needed like: たべる(食べる). The "reading" field should be the hiragana reading.'
              : ''
          }`,
        },
      ],
    });

    const toolUse = response.content.find(block => block.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') {
      throw new Error('No tool use in response');
    }

    const input = toolUse.input as { cards: Array<Record<string, string>> };
    return Response.json({ cards: input.cards });
  } catch (error) {
    console.error('Flashcard generation error:', error);
    return Response.json(
      { error: 'Failed to generate flashcards' },
      { status: 500 }
    );
  }
}
