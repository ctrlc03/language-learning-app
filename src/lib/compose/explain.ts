/** Shapes shared by the /api/explain route and the Compose page. */

/** Longest text Compose holds and the route explains. */
export const MAX_COMPOSE_LENGTH = 500;

export interface ExplainRequest {
  text: string;
  /** The learner's lesson, so the explanation suits their level. */
  lesson: number;
}

export interface Explanation {
  /** Natural English for the text, or for what the learner most likely meant. */
  translation: string;
  /** Whether the text is correct, natural Mandarin. */
  correct: boolean;
  /** The text put right with as few changes as possible; '' when it is correct. */
  corrected: string;
  /** Pinyin for `corrected`. */
  correctedPinyin: string;
  /** What was wrong and why, or how the text is built. */
  notes: string[];
}
