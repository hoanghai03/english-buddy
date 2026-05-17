export interface TranscriptLine {
  start: number;
  end: number;
  en: string;
  vi: string;
}

export type VideoLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface VideoLesson {
  id: string;
  videoId: string;
  title: string;
  description: string;
  level: VideoLevel;
  topic: string;
  transcript: TranscriptLine[];
}

export interface WordResult {
  word: string;
  typed: string;
  correct: boolean;
}
