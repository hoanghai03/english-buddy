import { Component, ElementRef, HostListener, OnDestroy, ViewChild, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { AudioLessonService } from '../../services/audio-lesson.service';
import { AudioLesson, AudioLine } from '../../models/audio-lesson.model';
import { WordResult } from '../../models/lesson.model';

type Mode = 'dictation' | 'listen';
type Lang = 'en' | 'vi';

interface KeyConfig {
  replay: string;
  check: string;
  next: string;
  prev: string;
  reveal: string;
}

const DEFAULT_KEYS: KeyConfig = {
  replay: 'r',
  check: 'Enter',
  next: 'ArrowRight',
  prev: 'ArrowLeft',
  reveal: 'Escape',
};

const KEY_DISPLAY: Record<string, string> = {
  ' ': 'Space', 'Enter': 'Enter', 'Escape': 'Esc',
  'ArrowRight': '→', 'ArrowLeft': '←', 'ArrowUp': '↑', 'ArrowDown': '↓',
  'Backspace': 'Bksp', 'Tab': 'Tab',
};

// Bỏ mọi dấu câu kể cả apostrophe để "it's" = "its", "don't" = "dont"
const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

@Component({
  selector: 'app-audio',
  imports: [FormsModule, NgClass],
  templateUrl: './audio.html',
  styleUrl: './audio.css',
})
export class AudioComponent implements OnDestroy {
  @ViewChild('dictInput') dictInputRef?: ElementRef<HTMLTextAreaElement>;

  private audioLessonService = inject(AudioLessonService);
  private router = inject(Router);

  constructor() {
    this.audioLessonService.loadLessons();
  }

  readonly levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
  filterLevel = signal<string>('all');
  loadingLesson = signal(false);

  readonly loading = this.audioLessonService.loading;
  readonly loadError = this.audioLessonService.error;

  filteredLessons = computed(() => {
    const lv = this.filterLevel();
    const all = this.audioLessonService.lessons();
    return lv === 'all' ? all : all.filter(l => l.level === lv);
  });

  activeLesson = signal<AudioLesson | null>(null);
  mode = signal<Mode>('dictation');
  lang = signal<Lang>('en');

  dictIndex = signal(0);
  inputText = '';
  checked = signal(false);
  revealed = signal(false);
  wordResults = signal<WordResult[]>([]);
  hint = signal<string | null>(null);
  score = computed(() => {
    const r = this.wordResults();
    if (!r.length) return 0;
    return Math.round((r.filter(w => w.correct).length / r.length) * 100);
  });

  speaking = signal(false);
  speechRate = signal(0.9);
  activeLine = signal(-1);
  confettiPieces = signal<{ x: number; color: string; delay: number; duration: number }[]>([]);

  // ── Settings ──────────────────────────────────────────────────────
  showSettings = signal(false);
  capturingAction = signal<keyof KeyConfig | null>(null);
  keyConfig = signal<KeyConfig>({ ...DEFAULT_KEYS });

  readonly configActions: { key: keyof KeyConfig; label: string }[] = [
    { key: 'replay', label: '🔊 Nghe lại câu' },
    { key: 'check', label: '✓ Kiểm tra / Gợi ý' },
    { key: 'next', label: '▶ Câu tiếp theo' },
    { key: 'prev', label: '◀ Câu trước' },
    { key: 'reveal', label: '👁 Hiện đáp án' },
  ];

  displayKey(key: string): string {
    return KEY_DISPLAY[key] ?? key.toUpperCase();
  }

  startCapture(action: keyof KeyConfig) {
    this.capturingAction.set(action);
  }

  resetKeyConfig() {
    this.keyConfig.set({ ...DEFAULT_KEYS });
    this.capturingAction.set(null);
  }

  @HostListener('document:keydown', ['$event'])
  handleGlobalKey(e: KeyboardEvent) {
    const capturing = this.capturingAction();
    if (capturing !== null) {
      e.preventDefault();
      if (e.key !== 'Escape') {
        this.keyConfig.update(c => ({ ...c, [capturing]: e.key }));
      }
      this.capturingAction.set(null);
      return;
    }

    if (this.showSettings() || this.mode() !== 'dictation' || !this.activeLesson()) return;

    const cfg = this.keyConfig();
    const inTextarea = (e.target as HTMLElement).tagName === 'TEXTAREA';

    if (inTextarea && e.key === cfg.check && !e.shiftKey) {
      e.preventDefault();
      this.checkAnswer();
      return;
    }

    if (!inTextarea) {
      if (e.key === cfg.replay) { e.preventDefault(); this.playCurrent(); }
      else if (e.key === cfg.next) { e.preventDefault(); this.next(); }
      else if (e.key === cfg.prev) { e.preventDefault(); this.prev(); }
      else if (e.key === cfg.reveal && this.checked() && !this.revealed()) { e.preventDefault(); this.reveal(); }
    }
  }

  // ── Lesson ────────────────────────────────────────────────────────
  get currentLine(): AudioLine | null {
    return this.activeLesson()?.lines[this.dictIndex()] ?? null;
  }

  async selectLesson(lesson: AudioLesson) {
    this.loadingLesson.set(true);
    const full = await this.audioLessonService.loadLessonDetail(lesson.id);
    this.loadingLesson.set(false);
    if (!full) return;
    this.activeLesson.set(full);
    this.dictIndex.set(0);
    this.resetDictation();
  }

  speak(text: string) {
    window.speechSynthesis.cancel();
    this.speaking.set(true);
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-US';
    utt.rate = this.speechRate();
    utt.onend = () => this.speaking.set(false);
    utt.onerror = () => this.speaking.set(false);
    window.speechSynthesis.speak(utt);
  }

  playCurrent() {
    const line = this.currentLine;
    if (line) this.speak(line.en);
  }

  playLine(line: AudioLine, index: number) {
    this.activeLine.set(index);
    this.speak(line.en);
  }

  checkAnswer() {
    const line = this.currentLine;
    if (!line || !this.inputText.trim()) return;

    const rawExpected = line.en.split(/\s+/);
    const expected = rawExpected.map(normalize);
    const typed = normalize(this.inputText).split(/\s+/).filter(w => w.length > 0);

    // Build results for ALL expected words; untyped words show as pending
    const results: WordResult[] = expected.map((word, i) => ({
      word: rawExpected[i],
      typed: typed[i] ?? '',
      correct: i < typed.length && word === typed[i],
    }));
    if (typed.length > expected.length) {
      results.push({ word: 'Thừa', typed: typed.slice(expected.length).join(' '), correct: false });
    }
    this.wordResults.set(results);

    const firstWrongIdx = typed.findIndex((w, i) => w !== expected[i]);

    if (firstWrongIdx === -1 && typed.length >= expected.length) {
      // Complete and fully correct
      this.checked.set(true);
      this.hint.set(null);
      this.celebrate();
    } else if (firstWrongIdx === -1) {
      // Partially typed, all correct so far → hint next word
      this.hint.set(`💡 Từ tiếp theo: "${rawExpected[typed.length]}"`);
    } else {
      // Wrong word found → hint that word and move cursor there
      this.hint.set(`📍 Sửa từ thứ ${firstWrongIdx + 1}: "${rawExpected[firstWrongIdx]}"`);
      this.moveCursorToWord(firstWrongIdx);
    }
  }

  private celebrate() {
    this.triggerConfetti();
    this.playSuccessSound();
  }

  private triggerConfetti() {
    const colors = ['#7c3aed', '#ec4899', '#059669', '#d97706', '#2563eb', '#dc2626', '#f59e0b'];
    const pieces = Array.from({ length: 70 }, () => ({
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.6,
      duration: 1.5 + Math.random() * 1.2,
    }));
    this.confettiPieces.set(pieces);
    setTimeout(() => this.confettiPieces.set([]), 3500);
  }

  private playSuccessSound() {
    try {
      const ctx = new AudioContext();
      const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.13;
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
      });
    } catch {}
  }

  private moveCursorToWord(wordIndex: number) {
    setTimeout(() => {
      const el = this.dictInputRef?.nativeElement;
      if (!el) return;
      el.focus();
      const matches = [...this.inputText.matchAll(/\S+/g)];
      const match = matches[wordIndex];
      if (match?.index != null) {
        el.setSelectionRange(match.index, match.index + match[0].length);
      }
    });
  }

  reveal() { this.revealed.set(true); }

  next() {
    const lesson = this.activeLesson();
    if (!lesson || this.dictIndex() >= lesson.lines.length - 1) return;
    this.dictIndex.update(i => i + 1);
    this.resetDictation();
  }

  prev() {
    if (this.dictIndex() <= 0) return;
    this.dictIndex.update(i => i - 1);
    this.resetDictation();
  }

  resetDictation() {
    this.inputText = '';
    this.checked.set(false);
    this.revealed.set(false);
    this.wordResults.set([]);
    this.hint.set(null);
    window.speechSynthesis.cancel();
    this.speaking.set(false);
  }

  setMode(m: Mode) { this.mode.set(m); this.resetDictation(); this.activeLine.set(-1); }
  setLang(l: Lang) { this.lang.set(l); }
  goBack() { this.router.navigate(['/']); }

  ngOnDestroy() {
    window.speechSynthesis.cancel();
  }
}
