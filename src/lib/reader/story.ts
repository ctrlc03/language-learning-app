/** Shapes shared by the /api/story route and the reader's "New story" request. */

export const MAX_STORY_TOPIC_LENGTH = 60;

/** More unknown words than this share of a story's tokens triggers one retry. */
export const MAX_UNKNOWN_SHARE = 0.05;

export interface GeneratedStoryLine {
  text: string;
  pinyin: string;
  translation: string;
}

export interface GeneratedStory {
  title: string;
  titleChinese: string;
  lines: GeneratedStoryLine[];
}

export interface StoryRequest {
  lesson: number;
  topic?: string;
}

export interface StoryResponse {
  story: GeneratedStory;
  /** Words in the story the course has not reached by the requested lesson. */
  unknownWords: string[];
}
