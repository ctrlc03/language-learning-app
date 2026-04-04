import type { Language } from '@/types';

export function getLanguageEmoji(language: Language): string {
  return language === 'chinese' ? '🇨🇳' : '🇯🇵';
}

export function getLanguageName(language: Language): string {
  return language === 'chinese' ? 'Chinese' : 'Japanese';
}

export function getLanguageNativeName(language: Language): string {
  return language === 'chinese' ? '中文' : '日本語';
}

export function getAnnotationType(language: Language): string {
  return language === 'chinese' ? 'Pinyin' : 'Furigana';
}

export function getLevelSystem(language: Language): string {
  return language === 'chinese' ? 'HSK' : 'JLPT';
}

export function getLevelOptions(language: Language): string[] {
  if (language === 'chinese') {
    return [
      'HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6',
      'Pinyin & Adjectives', 'Time & Daily Schedule', 'Family & Occupations',
      'Shopping & Money', 'Chinese New Year & Mobile Payment', 'Review & Advanced Topics',
      'Asking for Directions', 'Class Notes & Dialogues', 'Ordering Food & Drinks',
      'Question Words & Patterns', 'HSK 1 Characters (你好)', 'HSK 2 Characters (认识)',
      'Body', 'China Travel Plan',
    ];
  }
  return [
    'JLPT N5', 'JLPT N4', 'JLPT N3', 'JLPT N2', 'JLPT N1',
    'Irodori Starter', 'Irodori Elementary 1', 'Irodori Elementary 2',
  ];
}
