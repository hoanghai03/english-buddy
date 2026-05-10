export interface TranscriptLine {
  start: number;
  end: number;
  en: string;
  vi: string;
}

export interface VideoLesson {
  id: string;
  videoId: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  topic: string;
  transcript: TranscriptLine[];
}

export interface WordResult {
  word: string;
  typed: string;
  correct: boolean;
}
