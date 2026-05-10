export interface Character {
  id: number;
  name: string;
  job: string;
  location: string;
  flag: string;
  avatar: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  topics: string[];
  accent: string;
}

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}
