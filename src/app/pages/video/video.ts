import {
  Component, ElementRef, HostListener, OnInit, OnDestroy, ViewChild, signal, computed, inject, NgZone
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { LessonService } from '../../services/lesson.service';
import { TranscriptService } from '../../services/transcript.service';
import { AuthService } from '../../services/auth.service';
import { VideoLesson, TranscriptLine, WordResult } from '../../models/lesson.model';

declare const YT: any;

type Mode = 'listen' | 'dictation';
type Lang = 'en' | 'vi';

interface KeyConfig {
  replay: string;
  check: string;
  next: string;
  prev: string;
  reveal: string;
}

const DEFAULT_KEYS: KeyConfig = {
  replay: 'Control',
  check: 'Enter',
  next: 'ArrowRight',
  prev: 'ArrowLeft',
  reveal: 'Escape',
};

const KEY_DISPLAY: Record<string, string> = {
  ' ': 'Space', 'Enter': 'Enter', 'Escape': 'Esc', 'Control': 'Ctrl', 'Alt': 'Alt', 'Shift': 'Shift',
  'ArrowRight': '→', 'ArrowLeft': '←', 'ArrowUp': '↑', 'ArrowDown': '↓',
  'Backspace': 'Bksp', 'Tab': 'Tab',
};

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

@Component({
  selector: 'app-video',
  imports: [FormsModule, NgClass, RouterLink],
  templateUrl: './video.html',
  styleUrl: './video.css',
})
export class VideoComponent implements OnInit, OnDestroy {
  @ViewChild('dictInput') dictInputRef?: ElementRef<HTMLTextAreaElement>;

  private lessonService = inject(LessonService);
  private transcriptService = inject(TranscriptService);
  private router = inject(Router);
  private zone = inject(NgZone);
  private authService = inject(AuthService);

  readonly isLoggedIn = this.authService.isLoggedIn;
  readonly currentUser = this.authService.currentUser;

  readonly lessons = this.lessonService.lessons;
  activeLesson = signal<VideoLesson | null>(null);
  mode = signal<Mode>('listen');
  lang = signal<Lang>('en');

  // Sidebar
  sidebarCollapsed = signal(false);
  activeNav = signal('videos');
  activeLang = signal('EN');

  // Import
  importTab = signal<'youtube' | 'upload'>('youtube');
  importUrl = '';
  importVideoLang = 'en';
  importing = signal(false);
  importError = signal('');
  importPanelOpen = signal(false);
  accountDropdownOpen = signal(false);
  loginPromptOpen = signal(false);

  // Mobile search
  mobileSearchOpen = signal(false);

  // Search + category + level
  searchQuery = signal('');
  categoryFilter = signal('Toàn bộ');
  levelFilter = signal('all');

  readonly cefrLevels = [
    { key: 'A1', name: 'Sơ cấp',    color: '#16a34a' },
    { key: 'A2', name: 'Cơ bản',    color: '#0891b2' },
    { key: 'B1', name: 'Trung cấp', color: '#2563eb' },
    { key: 'B2', name: 'Khá',       color: '#7c3aed' },
    { key: 'C1', name: 'Nâng cao',  color: '#db2777' },
    { key: 'C2', name: 'Thành thạo', color: '#9f1239' },
  ];

  filteredLessons = computed(() => {
    const cat = this.categoryFilter();
    const lv  = this.levelFilter();
    const q   = this.searchQuery().toLowerCase().trim();
    let lessons = this.lessons();

    if (cat !== 'Toàn bộ') {
      const topicMap: Record<string, string[]> = {
        'Truyền động lực': ['Motivation'],
        'Công nghệ': ['Technology', 'Tech'],
        'Kinh doanh': ['Business'],
        'Tin tức': ['News'],
        'Phim': ['Film', 'Movie'],
        'Văn hóa': ['Culture'],
        'Podcast': ['Podcast'],
        'AI': ['AI'],
      };
      const topics = topicMap[cat] ?? [cat];
      lessons = lessons.filter(l => topics.some(t => l.topic.toLowerCase().includes(t.toLowerCase())));
    }

    if (lv !== 'all') {
      lessons = lessons.filter(l => l.level === lv);
    }

    if (q) {
      lessons = lessons.filter(l =>
        l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)
      );
    }

    return lessons;
  });

  // Transcript
  currentTranscript = signal<TranscriptLine[]>([]);
  transcriptLoading = signal(false);
  transcriptError = signal('');
  activeLineIndex = signal(-1);

  // Dictation
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

  // Settings
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

  startCapture(action: keyof KeyConfig) { this.capturingAction.set(action); }

  resetKeyConfig() {
    this.keyConfig.set({ ...DEFAULT_KEYS });
    this.capturingAction.set(null);
  }

  bottomNavHidden = signal(false);

  private player: any = null;
  private tracker: any = null;
  private pauseAt: number | null = null;
  private lastScrollY = 0;
  private readonly onScroll = () => {
    const y = window.scrollY;
    if (y > this.lastScrollY + 6 && y > 60) {
      this.zone.run(() => this.bottomNavHidden.set(true));
    } else if (y < this.lastScrollY - 6) {
      this.zone.run(() => this.bottomNavHidden.set(false));
    }
    this.lastScrollY = y;
  };

  readonly streakDays = [
    { label: 'Th2', filled: true },
    { label: 'Th3', filled: true },
    { label: 'Th4', filled: true },
    { label: 'Th5', filled: false },
    { label: 'Th6', filled: false },
    { label: 'Th7', filled: false },
    { label: 'CN', filled: false },
  ];

  readonly learningLangs = [
    { code: 'JA', flag: '🇯🇵' },
    { code: 'EN', flag: '🇺🇸' },
    { code: 'ZH-CN', flag: '🇨🇳' },
    { code: 'KO', flag: '🇰🇷' },
  ];

  readonly categories = [
    { key: 'Toàn bộ', label: 'Toàn bộ', icon: '🍀' },
    { key: 'Podcast', label: 'Podcast', icon: '🎙' },
    { key: 'Công nghệ', label: 'Công nghệ', icon: '💻' },
    { key: 'AI', label: 'AI', icon: '🤖' },
    { key: 'Tin tức', label: 'Tin tức', icon: '📰' },
    { key: 'Truyền động lực', label: 'Truyền động lực', icon: '🔥' },
    { key: 'Kinh doanh', label: 'Kinh doanh', icon: '💼' },
    { key: 'Phim', label: 'Phim', icon: '🎬' },
    { key: 'Văn hóa', label: 'Văn hóa', icon: '🏛' },
    { key: 'Khác', label: 'Khác', icon: '✨' },
  ];

  getLevelLabel(level: string): string {
    const map: Record<string, string> = {
      A1: 'A1 · Sơ cấp',
      A2: 'A2 · Cơ bản',
      B1: 'B1 · Trung cấp',
      B2: 'B2 · Khá',
      C1: 'C1 · Nâng cao',
      C2: 'C2 · Thành thạo',
    };
    return map[level] ?? level;
  }

  ngOnInit() {
    void this.lessonService.loadLessons();
    window.addEventListener('scroll', this.onScroll, { passive: true });
    (window as any)['onYouTubeIframeAPIReady'] = () => {
      this.zone.run(() => {
        if (this.activeLesson()) this.createPlayer();
      });
    };
    if (!(window as any).YT) {
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    }
  }

  closePlayer() {
    if (this.player) { try { this.player.destroy(); } catch {} this.player = null; }
    if (this.tracker) { clearInterval(this.tracker); this.tracker = null; }
    this.activeLesson.set(null);
  }

  async selectLesson(lesson: VideoLesson) {
    // Always destroy the old player — its iframe is removed when activeLesson changes
    if (this.player) { try { this.player.destroy(); } catch {} this.player = null; }
    if (this.tracker) { clearInterval(this.tracker); this.tracker = null; }

    this.activeLesson.set(lesson);
    this.dictIndex.set(0);
    this.activeLineIndex.set(-1);
    this.resetDictation();
    this.currentTranscript.set([]);
    this.transcriptError.set('');
    this.transcriptLoading.set(true);

    const detail = lesson.transcript.length ? lesson : await this.lessonService.loadLessonDetail(lesson.id);
    this.zone.run(() => {
      const lines = detail?.transcript ?? [];
      if (detail) this.activeLesson.set(detail);
      this.currentTranscript.set(lines);
      this.transcriptLoading.set(false);
      if (!lines.length) {
        this.transcriptError.set('Video này chưa có phụ đề trong hệ thống. Hãy nhập lại link YouTube để lưu phụ đề.');
      }
    });

    setTimeout(() => {
      if ((window as any).YT?.Player) this.createPlayer();
    }, 150);
  }

  private createPlayer() {
    const lesson = this.activeLesson();
    if (!lesson || !document.getElementById('yt-player')) return;
    this.player = new YT.Player('yt-player', {
      videoId: lesson.videoId,
      playerVars: { rel: 0, modestbranding: 1, cc_load_policy: 0 },
      events: { onReady: () => this.startTracking() },
    });
  }

  private startTracking() {
    if (this.tracker) clearInterval(this.tracker);
    this.tracker = setInterval(() => {
      this.zone.run(() => {
        if (!this.player?.getCurrentTime) return;
        const t: number = this.player.getCurrentTime();
        const lines = this.currentTranscript();
        this.activeLineIndex.set(lines.findIndex(l => t >= l.start && t < l.end));
        if (this.pauseAt !== null && t >= this.pauseAt) {
          this.player.pauseVideo();
          this.pauseAt = null;
        }
      });
    }, 300);
  }

  seekTo(line: TranscriptLine) {
    this.player?.seekTo(line.start, true);
    this.player?.playVideo();
  }

  get currentLine(): TranscriptLine | null {
    return this.currentTranscript()[this.dictIndex()] ?? null;
  }

  playSentence() {
    const line = this.currentLine;
    if (!line) return;
    this.pauseAt = line.end;
    this.player?.seekTo(line.start, true);
    this.player?.playVideo();
  }

  checkAnswer() {
    const line = this.currentLine;
    if (!line || !this.inputText.trim()) return;

    const rawExpected = line.en.split(/\s+/);
    const expected = rawExpected.map(normalize);
    const typed = normalize(this.inputText).split(/\s+/).filter(w => w.length > 0);

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
      this.checked.set(true);
      this.hint.set(null);
    } else if (firstWrongIdx === -1) {
      this.hint.set(`💡 Từ tiếp theo: "${rawExpected[typed.length]}"`);
    } else {
      this.hint.set(`📍 Sửa từ thứ ${firstWrongIdx + 1}: "${rawExpected[firstWrongIdx]}"`);
      this.moveCursorToWord(firstWrongIdx);
    }
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

    if (e.key === cfg.replay) {
      e.preventDefault();
      this.playSentence();
      return;
    }

    if (inTextarea && e.key === cfg.check && !e.shiftKey) {
      e.preventDefault();
      this.checkAnswer();
      return;
    }

    if (!inTextarea) {
      if (e.key === cfg.next) { e.preventDefault(); this.next(); }
      else if (e.key === cfg.prev) { e.preventDefault(); this.prev(); }
      else if (e.key === cfg.reveal && this.checked() && !this.revealed()) { e.preventDefault(); this.reveal(); }
    }
  }

  reveal() { this.revealed.set(true); }

  next() {
    if (this.dictIndex() >= this.currentTranscript().length - 1) return;
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
  }

  onImportBtnClick() {
    if (!this.isLoggedIn()) {
      this.loginPromptOpen.set(true);
      return;
    }
    this.importPanelOpen.update(v => !v);
  }

  logout() {
    this.authService.logout();
    this.accountDropdownOpen.set(false);
  }

  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const p of patterns) {
      const m = url.trim().match(p);
      if (m) return m[1];
    }
    return null;
  }

  async importVideo() {
    const videoId = this.extractVideoId(this.importUrl);
    if (!videoId) {
      this.importError.set('URL không hợp lệ. Nhập link YouTube hoặc video ID (11 ký tự).');
      return;
    }
    this.importing.set(true);
    this.importError.set('');

    try {
      const lines = await firstValueFrom(this.transcriptService.fetch(videoId, this.importVideoLang));
      if (!lines.length) {
        this.importing.set(false);
        this.importError.set('Video không có phụ đề tiếng Anh. Hãy kiểm tra video có bật CC không.');
        return;
      }
      const lesson = await this.lessonService.importYouTube(this.importUrl, lines);
      this.importing.set(false);
      this.importUrl = '';
      this.importPanelOpen.set(false);
      void this.selectLesson(lesson);
    } catch {
      this.importing.set(false);
      this.importError.set('Không thể nhập video. Vui lòng thử lại.');
    }
  }

  setMode(m: Mode) { this.mode.set(m); this.resetDictation(); }
  setLang(l: Lang) { this.lang.set(l); }
  goBack() { this.router.navigate(['/']); }

  formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  ngOnDestroy() {
    if (this.tracker) { clearInterval(this.tracker); this.tracker = null; }
    if (this.player) { try { this.player.destroy(); } catch {} this.player = null; }
    window.removeEventListener('scroll', this.onScroll);
  }
}
