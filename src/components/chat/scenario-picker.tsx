'use client';

import type { Language, ChatScenario } from '@/types';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const SCENARIOS: ChatScenario[] = [
  // Chinese scenarios
  {
    id: 'zh-greetings',
    name: 'Greetings & Introductions',
    nameNative: '问候和自我介绍',
    description: 'Practice basic greetings and introducing yourself',
    language: 'chinese',
    difficulty: 'beginner',
    systemPromptAddition: 'Focus on greetings, introductions, and basic personal information exchange. Start by greeting the student and asking their name.',
  },
  {
    id: 'zh-restaurant',
    name: 'At a Restaurant',
    nameNative: '在餐厅',
    description: 'Order food, ask about the menu, pay the bill',
    language: 'chinese',
    difficulty: 'beginner',
    systemPromptAddition: 'Role-play as a restaurant server. Present a simple menu, take orders, and help with food-related vocabulary.',
  },
  {
    id: 'zh-shopping',
    name: 'Shopping',
    nameNative: '购物',
    description: 'Buy things, ask prices, bargain',
    language: 'chinese',
    difficulty: 'intermediate',
    systemPromptAddition: 'Role-play as a market vendor. Help practice numbers, prices, colors, sizes, and bargaining.',
  },
  {
    id: 'zh-directions',
    name: 'Asking Directions',
    nameNative: '问路',
    description: 'Navigate a city, ask for and give directions',
    language: 'chinese',
    difficulty: 'intermediate',
    systemPromptAddition: 'Role-play as a local person giving directions. Practice location words, transportation vocabulary, and directional phrases.',
  },
  {
    id: 'zh-travel',
    name: 'Travel & Transportation',
    nameNative: '旅行和交通',
    description: 'Book tickets, check in at hotels, plan trips',
    language: 'chinese',
    difficulty: 'intermediate',
    systemPromptAddition: 'Help the student practice travel scenarios: booking trains/flights, checking into hotels, asking about schedules.',
  },
  {
    id: 'zh-daily',
    name: 'Daily Life',
    nameNative: '日常生活',
    description: 'Talk about your daily routine and hobbies',
    language: 'chinese',
    difficulty: 'beginner',
    systemPromptAddition: 'Have a casual conversation about daily routines, hobbies, and lifestyle. Ask about their day and share yours.',
  },
  // Japanese scenarios
  {
    id: 'ja-greetings',
    name: 'Greetings & Introductions',
    nameNative: '挨拶と自己紹介',
    description: 'Practice basic greetings and introducing yourself',
    language: 'japanese',
    difficulty: 'beginner',
    systemPromptAddition: 'Focus on greetings (こんにちは、はじめまして), introductions, and basic personal information. Use polite (です/ます) form.',
  },
  {
    id: 'ja-restaurant',
    name: 'At a Restaurant',
    nameNative: 'レストランで',
    description: 'Order food, ask about the menu',
    language: 'japanese',
    difficulty: 'beginner',
    systemPromptAddition: 'Role-play as a restaurant server. Practice ordering, menu vocabulary, and polite dining expressions.',
  },
  {
    id: 'ja-shopping',
    name: 'Shopping',
    nameNative: '買い物',
    description: 'Buy things, ask about products and prices',
    language: 'japanese',
    difficulty: 'intermediate',
    systemPromptAddition: 'Role-play as a shop clerk. Help practice shopping vocabulary, counters, prices, and polite expressions.',
  },
  {
    id: 'ja-directions',
    name: 'Asking Directions',
    nameNative: '道を聞く',
    description: 'Navigate around town, ask for directions',
    language: 'japanese',
    difficulty: 'intermediate',
    systemPromptAddition: 'Role-play as a helpful local. Practice directions, location words, and transportation vocabulary.',
  },
  {
    id: 'ja-travel',
    name: 'Travel',
    nameNative: '旅行',
    description: 'Book accommodations, plan sightseeing',
    language: 'japanese',
    difficulty: 'intermediate',
    systemPromptAddition: 'Help practice travel scenarios: booking ryokan/hotels, train tickets, asking about sightseeing spots.',
  },
  {
    id: 'ja-daily',
    name: 'Daily Life',
    nameNative: '日常生活',
    description: 'Chat about daily routine and interests',
    language: 'japanese',
    difficulty: 'beginner',
    systemPromptAddition: 'Have a casual conversation about daily routines, hobbies, and interests. Use です/ます form.',
  },
];

interface ScenarioPickerProps {
  language: Language;
  onSelect: (scenario: ChatScenario | null) => void;
}

export function ScenarioPicker({ language, onSelect }: ScenarioPickerProps) {
  const filtered = SCENARIOS.filter(s => s.language === language);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Choose a conversation scenario</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Or start a free conversation
        </p>
      </div>

      <button
        onClick={() => onSelect(null)}
        className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-center"
      >
        <p className="font-medium">Free Conversation</p>
        <p className="text-sm text-muted-foreground">Chat about anything</p>
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(scenario => (
          <button
            key={scenario.id}
            onClick={() => onSelect(scenario)}
            className="text-left"
          >
            <Card className="p-4 hover:border-primary/50 hover:bg-primary/5 transition-colors h-full">
              <p className="font-medium">{scenario.name}</p>
              <p className="text-sm text-primary mt-0.5">{scenario.nameNative}</p>
              <p className="text-xs text-muted-foreground mt-1">{scenario.description}</p>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}

export { SCENARIOS };
