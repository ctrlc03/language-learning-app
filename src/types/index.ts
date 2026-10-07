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
  /** Id of a scenario or lesson role-play in `@/lib/chat/scenarios`; the server builds its prompt. */
  scenarioId?: string;
  /** Role-play goals the learner has ticked off (indexes into the role-play's goals). */
  goalsDone?: number[];
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
  /** Scenario text for the system prompt. Lives in the server-side registry; never sent by a client. */
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
  /** Cards stored for this deck: up to four per word (one per direction), not words. */
  cardCount: number;
  /** The shipped deck this was created from (e.g. 'prebuilt-zh-lesson-12'), if any. */
  prebuiltId?: string;
  createdAt: number;
  updatedAt: number;
}

// Recall direction for a card. A single vocabulary item can spawn several
// cards, each drilling a different skill — scheduled independently by FSRS.
//  - 'read'    : hanzi/word → meaning (recognition)
//  - 'listen'  : audio      → meaning (listening)
//  - 'produce' : meaning    → hanzi/word (production, the hardest direction)
//  - 'cloze'   : example sentence with the word blanked → recall the word
export type CardDirection = 'read' | 'listen' | 'produce' | 'cloze';

export interface Flashcard {
  id: string;
  deckId: string;
  front: string; // character/word (always the native-script term)
  back: string; // translation
  reading: string; // pinyin or hiragana
  direction?: CardDirection; // defaults to 'read' when absent (legacy cards)
  exampleSentence?: string;
  exampleTranslation?: string;
  notes?: string;
  tags: string[];
  srs: SRSData;
  createdAt: number;
  updatedAt: number;
}

// SRS state. Now backed by FSRS; the first block is kept for scheduler
// compatibility and to migrate legacy SM2 cards, the second holds FSRS state.
export interface SRSData {
  easeFactor: number; // legacy SM2 ease; retained, unused by FSRS
  interval: number; // scheduled days until next review
  repetitions: number; // reps (FSRS)
  nextReviewDate: number; // due timestamp (ms)
  lastReviewDate?: number;
  grade?: SRSGrade;
  // FSRS memory state (absent on legacy cards until first review)
  stability?: number;
  difficulty?: number;
  elapsedDays?: number;
  scheduledDays?: number;
  learningSteps?: number;
  lapses?: number;
  state?: number; // 0 New, 1 Learning, 2 Review, 3 Relearning
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
  | 'dialogue-comprehension'
  | 'typed-recall';

export interface Exercise {
  id: string;
  type: ExerciseType;
  language: Language;
  difficulty: DifficultyLevel;
  question: string;
  instruction: string;
  data: ExerciseData;
  createdAt: number;
  /**
   * The item the exercise was built from (vocabulary id, dialogue id, rule id).
   * Recently-seen filtering compares these, since `id` carries a random suffix.
   */
  sourceId?: string;
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
  | DialogueComprehensionExerciseData
  | TypedRecallData;

export interface MultipleChoiceData {
  type: 'multiple-choice';
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Sentence-level multiple choice. Three directions:
//  - 'toMeaning': show the sentence (with furigana), options are translations
//  - 'toSentence': show the meaning, options are full sentences (with furigana)
//  - 'pinyinToMeaning': show only the romanized reading (pinyin), options are
//    translations — train reading the romanization without the characters
export interface SentenceMcData {
  type: 'sentence-mc';
  direction: 'toMeaning' | 'toSentence' | 'pinyinToMeaning';
  sentence: string; // the target sentence (native script)
  sentenceFurigana?: FuriSegment[]; // per-kanji ruby for the sentence
  sentencePinyin?: string; // romanized reading (pinyinToMeaning prompt)
  translation: string; // English meaning of the sentence
  options: string[]; // toMeaning: translations; toSentence: sentences
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
  /** Other valid orderings of the same tiles (e.g. time word before or after the subject). */
  acceptableOrders?: string[];
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

// Production: the prompt gives the meaning, the learner types the Chinese in
// characters or pinyin; graded by gradeAnswer (lib/language/answer.ts).
export interface TypedRecallData {
  type: 'typed-recall';
  /** What to say, in English: a word's meaning or a sentence. */
  prompt: string;
  /** Accepted answers in characters, the model answer first. */
  answers: string[];
  /** The course's pinyin for answers[0]. */
  answerPinyin?: string;
  /** Shown with the prompt: part of speech, or the pattern to use. */
  hint?: string;
  /** Shown after answering: why, or what the answer means word by word. */
  note?: string;
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
  level?: string; // HSK1, JLPT N5, etc.; for lesson words, the lesson that first teaches it
  /** Chinese lessons that teach this word (first lesson and any that revisit it). */
  lessons?: number[];
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

export type ListeningExerciseData = DictationData | ListenAndChooseData | DialogueComprehensionData;

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

/** `merge` keeps existing data unless the import is newer; `replace` wipes first. */
export type ImportMode = 'merge' | 'replace';

export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  /** Plain batch write of key → value; one transaction where the backend supports it. */
  setMany(entries: Record<string, unknown>): Promise<void>;
  delete(key: string): Promise<void>;
  getAll<T>(prefix: string): Promise<T[]>;
  query<T>(prefix: string, filter?: (item: T) => boolean): Promise<T[]>;
  exportData(): Promise<string>;
  importData(data: string, mode: ImportMode): Promise<void>;
}

// ============================================================
// User Progress Types
// ============================================================

export interface UserProgress {
  /** Consecutive days with activity, ending on `lastActiveDate`. */
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD, local time
  totalReviews: number;
  totalExercises: number;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD, local time
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
  /** Chinese lesson the learner is on; practice draws from lessons up to it. Unset = latest. */
  currentLesson?: number;
  apiKey?: string;
}
