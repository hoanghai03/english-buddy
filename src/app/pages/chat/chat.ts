import { Component, computed, ElementRef, inject, signal, ViewChild, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { CharacterService } from '../../services/character.service';
import { LanguageService } from '../../services/language.service';
import { Character } from '../../models/character.model';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, NgClass],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('messageList') messageList!: ElementRef;

  private characterService = inject(CharacterService);
  private router = inject(Router);
  lang = inject(LanguageService);

  characters = this.characterService.characters;
  active = computed(() => this.characterService.selectedCharacter());
  messages = computed(() => {
    const char = this.active();
    return char ? this.characterService.getMessages(char.id) : [];
  });

  inputText = '';
  isTyping = signal(false);
  searchQuery = signal('');

  filteredChars = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return q ? this.characters.filter(c => c.name.toLowerCase().includes(q) || c.job.toLowerCase().includes(q)) : this.characters;
  });

  constructor() {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  select(char: Character) {
    this.characterService.selectCharacter(char);
  }

  send() {
    const text = this.inputText.trim();
    const char = this.active();
    if (!text || !char) return;

    this.characterService.addMessage(char.id, { id: this.characterService.nextId(), text, sender: 'user', timestamp: new Date() });
    this.inputText = '';
    this.isTyping.set(true);

    setTimeout(() => {
      this.isTyping.set(false);
      this.characterService.addMessage(char.id, {
        id: this.characterService.nextId(),
        text: this.characterService.getNextReply(char.id),
        sender: 'ai',
        timestamp: new Date(),
      });
    }, 900 + Math.random() * 700);
  }

  onEnter(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
  }

  startCall() {
    this.router.navigate(['/call']);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  lastMsg(charId: number): string {
    return this.characterService.lastMessage(charId, this.lang.t('chat_start_convo'));
  }

  private scrollToBottom() {
    try {
      const el = this.messageList?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
