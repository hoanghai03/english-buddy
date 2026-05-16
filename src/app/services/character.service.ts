import { Injectable, signal } from '@angular/core';
import { Character, Message } from '../models/character.model';

const GREETINGS: Record<number, string> = {
  1: "Hello! I'm Emma. Lovely to meet you! How are you doing today?",
  2: "Hey! Jake here. What's up? Ready to talk some tech or just hang out?",
  3: "Bonjour — I mean, hello! Sophie here. Hungry to chat? 😄",
  4: "Ah, howya! Liam here. Grand day for a chat, isn't it?",
  5: "G'day! Mia here. Let's get that English of yours fit and strong!",
  6: "Good day. Noah speaking. What's on the agenda for today?",
  7: "Hey there! Zoe here. Love your vibe already — let's talk!",
  8: "Good evening. Professor Oliver at your service. Shall we begin?",
};

const AI_REPLIES = [
  "That's really interesting! Could you tell me more?",
  "I see what you mean. How long have you felt that way?",
  "Great point! Have you ever tried something different?",
  "Oh, that sounds wonderful! What was the best part?",
  "I totally agree! By the way, how's everything going for you lately?",
  "That makes a lot of sense. What do you think you'll do next?",
  "Wow, I didn't know that! Thanks for sharing.",
  "Haha, that's funny! Did anything else happen after that?",
  "Interesting perspective! How did you come to think that way?",
  "That's a great question actually. I'd say it depends on the situation.",
];

@Injectable({ providedIn: 'root' })
export class CharacterService {
  readonly characters: Character[] = [
    { id: 1, name: 'Emma Watson', job: 'High School Teacher', location: 'London, UK', flag: '🇬🇧', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=b6e3f4', level: 'Beginner', topics: ['Daily life', 'School', 'Hobbies'], accent: 'British' },
    { id: 2, name: 'Jake Mitchell', job: 'Software Engineer', location: 'San Francisco, USA', flag: '🇺🇸', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jake&backgroundColor=c0aede', level: 'Advanced', topics: ['Technology', 'Startups', 'Science'], accent: 'American' },
    { id: 3, name: 'Sophie Dubois', job: 'Chef & Food Blogger', location: 'Toronto, Canada', flag: '🇨🇦', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie&backgroundColor=ffd5dc', level: 'Intermediate', topics: ['Food', 'Travel', 'Culture'], accent: 'Canadian' },
    { id: 4, name: "Liam O'Brien", job: 'Journalist', location: 'Dublin, Ireland', flag: '🇮🇪', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam&backgroundColor=d1fae5', level: 'Intermediate', topics: ['News', 'Politics', 'Sports'], accent: 'Irish' },
    { id: 5, name: 'Mia Thompson', job: 'Fitness Coach', location: 'Sydney, Australia', flag: '🇦🇺', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&backgroundColor=fef9c3', level: 'Beginner', topics: ['Health', 'Fitness', 'Lifestyle'], accent: 'Australian' },
    { id: 6, name: 'Noah Williams', job: 'Business Analyst', location: 'New York, USA', flag: '🇺🇸', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah&backgroundColor=e0e7ff', level: 'Advanced', topics: ['Business', 'Finance', 'Leadership'], accent: 'American' },
    { id: 7, name: 'Zoe Carter', job: 'Graphic Designer', location: 'Auckland, New Zealand', flag: '🇳🇿', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe&backgroundColor=ffe4e6', level: 'Intermediate', topics: ['Art', 'Design', 'Music'], accent: 'Kiwi' },
    { id: 8, name: 'Oliver Grant', job: 'University Professor', location: 'Edinburgh, UK', flag: '🇬🇧', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&backgroundColor=dcfce7', level: 'Advanced', topics: ['History', 'Literature', 'Philosophy'], accent: 'Scottish' },
  ];

  selectedCharacter = signal<Character | null>(null);
  private messageMap = signal<Map<number, Message[]>>(new Map());
  private replyIndexMap = new Map<number, number>();
  private idCounter = 1;

  selectCharacter(character: Character) {
    this.selectedCharacter.set(character);
    if (!this.messageMap().has(character.id)) {
      this.addMessage(character.id, { id: this.idCounter++, text: GREETINGS[character.id], sender: 'ai', timestamp: new Date() });
    }
  }

  getMessages(charId: number): Message[] {
    return this.messageMap().get(charId) ?? [];
  }

  addMessage(charId: number, msg: Message) {
    this.messageMap.update(map => {
      const next = new Map(map);
      next.set(charId, [...(next.get(charId) ?? []), msg]);
      return next;
    });
  }

  getNextReply(charId: number): string {
    const idx = (this.replyIndexMap.get(charId) ?? 0) % AI_REPLIES.length;
    this.replyIndexMap.set(charId, idx + 1);
    return AI_REPLIES[idx];
  }

  nextId(): number { return this.idCounter++; }

  getRandom(): Character {
    return this.characters[Math.floor(Math.random() * this.characters.length)];
  }

  lastMessage(charId: number, fallback = 'Bắt đầu trò chuyện...'): string {
    const msgs = this.messageMap().get(charId) ?? [];
    if (!msgs.length) return fallback;
    const last = msgs[msgs.length - 1];
    return last.text.length > 40 ? last.text.slice(0, 40) + '…' : last.text;
  }
}
