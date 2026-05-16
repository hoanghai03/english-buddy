export interface AudioLine {
  en: string;
  vi: string;
}

export interface AudioLesson {
  id: string;
  title: string;
  description: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  topic: string;
  lines: AudioLine[];
}
