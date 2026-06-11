// ============================================================
// Language Types
// ============================================================

export type Language = 'chinese' | 'japanese';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface LanguageConfig {
  language: Language;
  difficulty: DifficultyLevel;
  showAnnotations: boolean; // pinyin/furigana
  speechRate: number; // 0.5 - 2.0
}

// ============================================================
// Chat Types
// ============================================================

export interface Conversation {
  id: string;
  language: Language;
  difficulty: DifficultyLevel;
  scenario?: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: MessageMetadata;
  createdAt: number;
}

export interface MessageMetadata {
  corrections?: Correction[];
  vocabulary?: VocabularyItem[];
  grammarNotes?: string[];
}

export interface Correction {
  original: string;
  corrected: string;
  explanation: string;
}

export interface ChatScenario {
  id: string;
  name: string;
  nameNative: string;
  description: string;
  language: Language;
  difficulty: DifficultyLevel;
  systemPromptAddition: string;
}

// ============================================================
// Flashcard / SRS Types
// ============================================================

export interface FlashcardDeck {
  id: string;
  name: string;
  language: Language;
  description: string;
  cardCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string; // character/word
  back: string; // translation
  reading: string; // pinyin or hiragana
  exampleSentence?: string;
  exampleTranslation?: string;
  notes?: string;
  tags: string[];
  srs: SRSData;
  createdAt: number;
  updatedAt: number;
}

export interface SRSData {
  easeFactor: number; // starts at 2.5
  interval: number; // days
  repetitions: number;
  nextReviewDate: number; // timestamp
  lastReviewDate?: number;
  grade?: SRSGrade;
}

export type SRSGrade = 1 | 2 | 3 | 4 | 5;
// 1 = Again, 2 = Hard-fail, 3 = Hard, 4 = Good, 5 = Easy

export interface ReviewSession {
  deckId: string;
  cards: Flashcard[];
  currentIndex: number;
  results: ReviewResult[];
  startedAt: number;
}

export interface ReviewResult {
  cardId: string;
  grade: SRSGrade;
  timeSpent: number; // ms
}

// ============================================================
// Exercise Types
// ============================================================

export type ExerciseType =
  | 'multiple-choice'
  | 'sentence-mc'
  | 'fill-in-blank'
  | 'translation'
  | 'sentence-construction'
  | 'character-recognition'
  | 'grammar-drill'
  | 'dialogue-reading'
  | 'dialogue-comprehension';

export interface Exercise {
  id: string;
  type: ExerciseType;
  language: Language;
  difficulty: DifficultyLevel;
  question: string;
  instruction: string;
  data: ExerciseData;
  createdAt: number;
}

export type ExerciseData =
  | MultipleChoiceData
  | SentenceMcData
  | FillInBlankData
  | TranslationData
  | SentenceConstructionData
  | CharacterRecognitionData
  | GrammarDrillData
  | DialogueReadingData
  | DialogueComprehensionExerciseData;

export interface MultipleChoiceData {
  type: 'multiple-choice';
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Sentence-level multiple choice. Two directions:
//  - 'toMeaning': show the sentence (with furigana), options are translations
//  - 'toSentence': show the meaning, options are full sentences (with furigana)
export interface SentenceMcData {
  type: 'sentence-mc';
  direction: 'toMeaning' | 'toSentence';
  sentence: string;                          // the target sentence (native script)
  sentenceFurigana?: FuriSegment[];          // per-kanji ruby for the sentence
  translation: string;                       // English meaning of the sentence
  options: string[];                         // toMeaning: translations; toSentence: sentences
  optionFurigana?: (FuriSegment[] | null)[]; // furigana for sentence options (toSentence)
  correctIndex: number;
  explanation?: string;
}

export interface FillInBlankData {
  type: 'fill-in-blank';
  sentence: string; // with ___ for blank
  sentencePinyin?: string; // pinyin reading of the sentence (blank preserved)
  translation?: string; // English meaning of the full sentence
  answer: string;
  acceptableAnswers: string[];
  hint?: string;
  options?: string[]; // clickable word options (when present, renders as pick-from-options)
  optionReadings?: (string | null)[]; // pinyin/kana reading per option
  correctIndex?: number; // index of correct option in options[]
}

export interface TranslationData {
  type: 'translation';
  sourceText: string;
  sourceLanguage: 'english' | Language;
  targetLanguage: 'english' | Language;
  sampleAnswer: string;
}

export interface SentenceConstructionData {
  type: 'sentence-construction';
  words: string[];
  wordReadings?: (string | null)[]; // pinyin reading per word tile (aligned with words[])
  correctOrder: string;
  correctPinyin?: string; // pinyin reading of the full correct sentence
  translation: string;
}

export interface CharacterRecognitionData {
  type: 'character-recognition';
  character: string;
  options: string[];
  correctIndex: number;
  reading: string;
  meaning: string;
}

export interface GrammarDrillData {
  type: 'grammar-drill';
  grammarPoint: string;
  sentence: string; // with blank
  answer: string;
  acceptableAnswers: string[];
  explanation: string;
  pinyin?: string; // sentence with pinyin (blank matches sentence blank)
  translation?: string; // English translation/hint
  options?: string[]; // multiple choice options (when present, renders as pick-from-options)
  optionReadings?: (string | null)[]; // pinyin reading per option
  correctIndex?: number; // index of correct option in options[]
}

// A run of text with an optional furigana reading. `r` is present only when
// `t` contains kanji that should be annotated (hiragana rendered above it).
export interface FuriSegment {
  t: string;
  r?: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  pinyin: string;
  translation: string;
  furigana?: FuriSegment[]; // per-kanji ruby segments (Japanese)
}

export interface DialogueReadingData {
  type: 'dialogue-reading';
  title: string;
  setting: string;
  lines: DialogueLine[];
}

// A reading-comprehension exercise: show a short dialogue, then ask one
// multiple-choice question about it. Distinct from the listening-flow
// DialogueComprehensionData (which has no readings/translations).
export interface DialogueComprehensionExerciseData {
  type: 'dialogue-comprehension';
  title: string;
  setting: string;
  lines: DialogueLine[];
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface ExerciseResult {
  exerciseId: string;
  exerciseType: ExerciseType;
  correct: boolean;
  userAnswer: string;
  feedback?: string;
  completedAt: number;
}

// ============================================================
// Vocabulary Types
// ============================================================

export interface VocabularyItem {
  id: string;
  language: Language;
  word: string;
  reading: string; // pinyin or hiragana/katakana
  meaning: string;
  partOfSpeech?: string;
  level?: string; // HSK1, JLPT N5, etc.
  topic?: string;
  exampleSentence?: string;
  examplePinyin?: string;
  exampleTranslation?: string;
}

// ============================================================
// Listening Types
// ============================================================

export type ListeningExerciseType = 'dictation' | 'listen-and-choose' | 'dialogue-comprehension';

export interface ListeningExercise {
  id: string;
  type: ListeningExerciseType;
  language: Language;
  difficulty: DifficultyLevel;
  text: string; // the text to be spoken
  data: ListeningExerciseData;
}

export type ListeningExerciseData =
  | DictationData
  | ListenAndChooseData
  | DialogueComprehensionData;

export interface DictationData {
  type: 'dictation';
  text: string;
  hint?: string;
}

export interface ListenAndChooseData {
  type: 'listen-and-choose';
  question: string;
  options: string[];
  correctIndex: number;
}

export interface DialogueComprehensionData {
  type: 'dialogue-comprehension';
  dialogue: { speaker: string; text: string }[];
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
}

// ============================================================
// Storage Types
// ============================================================

export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  getAll<T>(prefix: string): Promise<T[]>;
  query<T>(prefix: string, filter?: (item: T) => boolean): Promise<T[]>;
  exportData(): Promise<string>;
  importData(data: string): Promise<void>;
}

// ============================================================
// User Progress Types
// ============================================================

export interface UserProgress {
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  dailyActivity: DailyActivity[];
  totalReviews: number;
  totalExercises: number;
  totalConversations: number;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  reviews: number;
  exercises: number;
  conversationMessages: number;
  newCards: number;
  correctAnswers: number;
  totalAnswers: number;
}

// ============================================================
// Settings Types
// ============================================================

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: Language;
  difficulty: DifficultyLevel;
  showAnnotations: boolean;
  speechRate: number;
  maxNewCardsPerDay: number;
  apiKey?: string;
}
