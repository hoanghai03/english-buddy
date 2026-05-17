import {
  Component, OnInit, OnDestroy, signal, computed, inject, NgZone
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LessonService } from '../../services/lesson.service';
import { TranscriptService } from '../../services/transcript.service';
import { VideoLesson, TranscriptLine, WordResult } from '../../models/lesson.model';

declare const YT: any;

type Mode = 'listen' | 'dictation';
type Lang = 'en' | 'vi';

@Component({
  selector: 'app-video',
  imports: [FormsModule, NgClass],
  templateUrl: './video.html',
  styleUrl: './video.css',
})
export class VideoComponent implements OnInit, OnDestroy {
  private lessonService = inject(LessonService);
  private transcriptService = inject(TranscriptService);
  private router = inject(Router);
  private zone = inject(NgZone);

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
  importing = signal(false);
  importError = signal('');
  importPanelOpen = signal(false);

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
  score = computed(() => {
    const r = this.wordResults();
    if (!r.length) return 0;
    return Math.round((r.filter(w => w.correct).length / r.length) * 100);
  });

  private player: any = null;
  private tracker: any = null;
  private pauseAt: number | null = null;

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

  selectLesson(lesson: VideoLesson) {
    this.activeLesson.set(lesson);
    this.dictIndex.set(0);
    this.activeLineIndex.set(-1);
    this.resetDictation();
    this.currentTranscript.set([]);
    this.transcriptError.set('');
    this.transcriptLoading.set(true);

    this.transcriptService.fetch(lesson.videoId).subscribe({
      next: (lines) => {
        this.zone.run(() => {
          this.currentTranscript.set(lines);
          this.transcriptLoading.set(false);
          if (!lines.length) {
            this.transcriptError.set('Video này không có phụ đề tiếng Anh.');
          }
        });
      },
      error: () => {
        this.zone.run(() => {
          this.transcriptLoading.set(false);
          this.transcriptError.set('Không thể tải transcript. Kiểm tra kết nối mạng.');
        });
      },
    });

    setTimeout(() => {
      if ((window as any).YT?.Player) {
        if (this.player) {
          this.player.loadVideoById({ videoId: lesson.videoId, startSeconds: 0 });
        } else {
          this.createPlayer();
        }
      }
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
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s']/g, '').trim();
    const expected = normalize(line.en).split(/\s+/);
    const actual = normalize(this.inputText).split(/\s+/);
    const results = expected.map((word, i) => ({
      word,
      typed: actual[i] ?? '',
      correct: word === (actual[i] ?? ''),
    }));
    if (actual.length > expected.length) {
      results.push({ word: 'Thừa', typed: actual.slice(expected.length).join(' '), correct: false });
    }
    this.wordResults.set(results);
    this.checked.set(true);
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

  importVideo() {
    const videoId = this.extractVideoId(this.importUrl);
    if (!videoId) {
      this.importError.set('URL không hợp lệ. Nhập link YouTube hoặc video ID (11 ký tự).');
      return;
    }
    this.importing.set(true);
    this.importError.set('');

    forkJoin({
      title: this.transcriptService.fetchTitle(videoId).pipe(catchError(() => of('Video YouTube'))),
      transcript: this.transcriptService.fetch(videoId),
    }).subscribe({
      next: ({ title, transcript }) => {
        this.zone.run(() => {
          if (!transcript.length) {
            this.importing.set(false);
            this.importError.set('Video này không có phụ đề tiếng Anh. Thử video khác.');
            return;
          }
          const lesson: VideoLesson = {
            id: Date.now().toString(),
            videoId,
            title,
            description: 'Video nhập từ YouTube',
            level: 'B1',
            topic: 'Custom',
            transcript: [],
          };
          this.lessonService.addLesson(lesson);
          this.importing.set(false);
          this.importUrl = '';
          this.importPanelOpen.set(false);
          this.selectLesson(lesson);
        });
      },
      error: () => {
        this.zone.run(() => {
          this.importing.set(false);
          this.importError.set('Không thể nhập video. Kiểm tra kết nối mạng.');
        });
      },
    });
  }

  setMode(m: Mode) { this.mode.set(m); this.resetDictation(); }
  setLang(l: Lang) { this.lang.set(l); }
  goBack() { this.router.navigate(['/']); }

  formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  onEnter(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.checkAnswer(); }
  }

  ngOnDestroy() {
    if (this.tracker) clearInterval(this.tracker);
    if (this.player) { try { this.player.destroy(); } catch {} }
  }
}
