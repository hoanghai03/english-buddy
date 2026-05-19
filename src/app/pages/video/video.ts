import {
  Component, ElementRef, HostListener, OnInit, OnDestroy, ViewChild, signal, computed, inject, NgZone, effect
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass, DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { LessonService } from '../../services/lesson.service';
import { TranscriptService } from '../../services/transcript.service';
import { AuthService } from '../../services/auth.service';
import { StreakService, StreakDto } from '../../services/streak.service';
import { SavedVideoService, SavedVideoDto } from '../../services/saved-video.service';
import { WatchHistoryService, WatchHistoryDto } from '../../services/watch-history.service';
import { VocabCardService, VocabCardDto } from '../../services/vocab-card.service';
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
  imports: [FormsModule, NgClass, RouterLink, DatePipe],
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
  private streakService = inject(StreakService);
  private savedVideoService = inject(SavedVideoService);
  private watchHistoryService = inject(WatchHistoryService);
  private vocabCardService = inject(VocabCardService);

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
  private positionSaver: any = null;
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

  // Streak (real data)
  streakData = signal<StreakDto | null>(null);
  streakDays = signal<{ label: string; filled: boolean }[]>([
    { label: 'Th2', filled: false },
    { label: 'Th3', filled: false },
    { label: 'Th4', filled: false },
    { label: 'Th5', filled: false },
    { label: 'Th6', filled: false },
    { label: 'Th7', filled: false },
    { label: 'CN', filled: false },
  ]);

  // Saved / history / vocab panels
  savedVideos = signal<SavedVideoDto[]>([]);
  savedVideosLoading = signal(false);
  watchHistory = signal<WatchHistoryDto[]>([]);
  watchHistoryLoading = signal(false);
  vocabCards = signal<VocabCardDto[]>([]);
  vocabCardsLoading = signal(false);

  // Current lesson saved status
  currentLessonIsSaved = signal(false);

  // Right-click context menu for vocab
  contextMenuVisible = signal(false);
  contextMenuX = signal(0);
  contextMenuY = signal(0);
  contextMenuWord = signal('');
  contextMenuTranslation = signal('');
  contextMenuTranslating = signal(false);
  contextMenuSaved = signal(false);

  readonly learningLangs = [
    { code: 'JA', flag: '🇯🇵', apiLang: 'ja' },
    { code: 'EN', flag: '🇺🇸', apiLang: 'en' },
    { code: 'ZH-CN', flag: '🇨🇳', apiLang: 'zh-hans' },
    { code: 'KO', flag: '🇰🇷', apiLang: 'ko' },
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
    if (this.isLoggedIn()) {
      void this.loadStreakAndCheckIn();
    }
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
    if (this.positionSaver) { clearInterval(this.positionSaver); this.positionSaver = null; }
    if (this.player) { try { this.player.destroy(); } catch {} this.player = null; }
    if (this.tracker) { clearInterval(this.tracker); this.tracker = null; }
    this.activeLesson.set(null);
    this.currentLessonIsSaved.set(false);
    this.hideContextMenu();
  }

  async loadStreakAndCheckIn() {
    try {
      const streak = await this.streakService.checkIn();
      this.streakData.set(streak);
      this.updateStreakDays(streak.currentStreak);
    } catch {}
  }

  private updateStreakDays(currentStreak: number) {
    const today = new Date();
    const dow = today.getDay(); // 0=Sun
    const days = ['CN', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7'];
    const labels = ['Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'CN'];
    const todayIdx = labels.indexOf(days[dow]);
    this.streakDays.set(labels.map((label, i) => ({
      label,
      filled: currentStreak > 0 && i <= todayIdx && i >= todayIdx - (currentStreak - 1),
    })));
  }

  setActiveLang(code: string) {
    this.activeLang.set(code);
    const apiLang = this.learningLangs.find(l => l.code === code)?.apiLang ?? undefined;
    void this.lessonService.loadLessons(undefined, apiLang);
  }

  async loadNavPanel(nav: string) {
    this.activeNav.set(nav);
    if (!this.isLoggedIn()) return;
    if (nav === 'saved' && !this.savedVideos().length) {
      this.savedVideosLoading.set(true);
      try { this.savedVideos.set(await this.savedVideoService.getSaved()); } catch {}
      this.savedVideosLoading.set(false);
    }
    if (nav === 'history' && !this.watchHistory().length) {
      this.watchHistoryLoading.set(true);
      try { this.watchHistory.set(await this.watchHistoryService.getHistory()); } catch {}
      this.watchHistoryLoading.set(false);
    }
    if (nav === 'vocab' && !this.vocabCards().length) {
      this.vocabCardsLoading.set(true);
      try { this.vocabCards.set(await this.vocabCardService.getCards()); } catch {}
      this.vocabCardsLoading.set(false);
    }
  }

  async toggleSaveLesson() {
    const lesson = this.activeLesson();
    if (!lesson || !this.isLoggedIn()) return;
    if (this.currentLessonIsSaved()) {
      await this.savedVideoService.unsave(lesson.id);
      this.currentLessonIsSaved.set(false);
      this.savedVideos.update(list => list.filter(s => s.lesson.id !== lesson.id));
    } else {
      await this.savedVideoService.save(lesson.id);
      this.currentLessonIsSaved.set(true);
      this.savedVideos.set([]);
    }
  }

  async deleteVocabCard(id: string) {
    await this.vocabCardService.deleteCard(id);
    this.vocabCards.update(list => list.filter(c => c.id !== id));
  }

  async onTranscriptContextMenu(event: MouseEvent, lineText: string) {
    const selection = window.getSelection()?.toString().trim();
    const word = selection || lineText;
    if (!word) return;
    event.preventDefault();
    this.contextMenuX.set(event.clientX);
    this.contextMenuY.set(event.clientY);
    this.contextMenuWord.set(word);
    this.contextMenuTranslation.set('');
    this.contextMenuSaved.set(false);
    this.contextMenuVisible.set(true);
    this.contextMenuTranslating.set(true);
    try {
      const translation = await this.vocabCardService.translate(word);
      this.contextMenuTranslation.set(translation);
    } catch {}
    this.contextMenuTranslating.set(false);
  }

  hideContextMenu() {
    this.contextMenuVisible.set(false);
    this.contextMenuSaved.set(false);
  }

  async saveWordFromContext() {
    if (!this.isLoggedIn()) return;
    const lesson = this.activeLesson();
    await this.vocabCardService.saveCard(
      this.contextMenuWord(),
      this.contextMenuTranslation(),
      null,
      lesson?.id ?? null
    );
    this.contextMenuSaved.set(true);
    this.vocabCards.set([]);
  }

  async selectLesson(lesson: VideoLesson) {
    // Always destroy the old player — its iframe is removed when activeLesson changes
    if (this.positionSaver) { clearInterval(this.positionSaver); this.positionSaver = null; }
    if (this.player) { try { this.player.destroy(); } catch {} this.player = null; }
    if (this.tracker) { clearInterval(this.tracker); this.tracker = null; }
    this.hideContextMenu();

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

    // Check saved status + load watch position
    if (this.isLoggedIn()) {
      void this.savedVideoService.isSaved(lesson.id).then(r => this.currentLessonIsSaved.set(r.saved)).catch(() => {});
      void this.watchHistoryService.getPosition(lesson.id).then(p => {
        if (p && p.positionSeconds > 0) this._resumePosition = p.positionSeconds;
      });
    }

    setTimeout(() => {
      if ((window as any).YT?.Player) this.createPlayer();
    }, 150);
  }

  private _resumePosition: number | null = null;

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
    // Seek to saved position if available
    if (this._resumePosition !== null && this._resumePosition > 0) {
      this.player?.seekTo(this._resumePosition, true);
      this._resumePosition = null;
    }
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

    // Save watch position every 10s
    if (this.isLoggedIn() && this.positionSaver) clearInterval(this.positionSaver);
    if (this.isLoggedIn()) {
      this.positionSaver = setInterval(() => {
        const lesson = this.activeLesson();
        if (!lesson || !this.player?.getCurrentTime) return;
        const pos: number = this.player.getCurrentTime();
        if (pos > 2) {
          void this.watchHistoryService.savePosition(lesson.id, pos)
            .then(() => this.watchHistory.set([]));
        }
      }, 10000);
    }
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (this.contextMenuVisible()) {
      const target = e.target as HTMLElement;
      if (!target.closest('.vocab-context-menu')) {
        this.hideContextMenu();
      }
    }
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
      const lesson = await this.lessonService.importYouTube(this.importUrl, lines, this.importVideoLang);
      this.importing.set(false);
      this.importUrl = '';
      this.importPanelOpen.set(false);
      void this.selectLesson(lesson);
    } catch {
      this.importing.set(false);
      this.importError.set('Không thể nhập video. Vui lòng thử lại.');
    }
  }

  readonly Math = Math;

  setMode(m: Mode) { this.mode.set(m); this.resetDictation(); }
  setLang(l: Lang) { this.lang.set(l); }
  goBack() { this.router.navigate(['/']); }

  formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  ngOnDestroy() {
    if (this.positionSaver) { clearInterval(this.positionSaver); this.positionSaver = null; }
    if (this.tracker) { clearInterval(this.tracker); this.tracker = null; }
    if (this.player) { try { this.player.destroy(); } catch {} this.player = null; }
    window.removeEventListener('scroll', this.onScroll);
  }
}
