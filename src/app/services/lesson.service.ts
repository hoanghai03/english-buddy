import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { VideoLesson, TranscriptLine } from '../models/lesson.model';
import { environment } from '../../environments/environment';

interface ApiVideoLessonSummary {
  id: string;
  videoId: string;
  title: string;
  description: string;
  level: string;
  topic: string;
  transcriptCount: number;
}

interface ApiVideoLessonDetail extends ApiVideoLessonSummary {
  transcript: { start: number; end: number; en: string; vi: string }[];
}

@Injectable({ providedIn: 'root' })
export class LessonService {
  private http = inject(HttpClient);

  private _lessons = signal<VideoLesson[]>([]);
  readonly lessons = this._lessons.asReadonly();
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async loadLessons(level?: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const url = level
        ? `${environment.apiUrl}/video-lessons?level=${level}`
        : `${environment.apiUrl}/video-lessons`;
      const lessons = await firstValueFrom(this.http.get<ApiVideoLessonSummary[]>(url));
      this._lessons.set(lessons.map(l => this.mapLesson(l, [])));
    } catch {
      this.error.set('Không thể tải danh sách video.');
    } finally {
      this.loading.set(false);
    }
  }

  async loadLessonDetail(id: string): Promise<VideoLesson | null> {
    try {
      const lesson = await firstValueFrom(
        this.http.get<ApiVideoLessonDetail>(`${environment.apiUrl}/video-lessons/${id}`)
      );
      const mapped = this.mapLesson(lesson, lesson.transcript);
      this.upsertLesson(mapped);
      return mapped;
    } catch {
      return null;
    }
  }

  async importYouTube(url: string, lines?: TranscriptLine[]): Promise<VideoLesson> {
    const lesson = await firstValueFrom(
      this.http.post<ApiVideoLessonDetail>(`${environment.apiUrl}/video-lessons/import-youtube`, {
        url,
        level: 'B1',
        topic: 'Custom',
        lines: lines ?? null,
      })
    );
    const mapped = this.mapLesson(lesson, lesson.transcript);
    this.upsertLesson(mapped);
    return mapped;
  }

  private upsertLesson(lesson: VideoLesson): void {
    this._lessons.update(items => {
      const rest = items.filter(l => l.id !== lesson.id);
      return [lesson, ...rest];
    });
  }

  private mapLesson(
    lesson: ApiVideoLessonSummary,
    transcript: ApiVideoLessonDetail['transcript']
  ): VideoLesson {
    return {
      id: lesson.id,
      videoId: lesson.videoId,
      title: lesson.title,
      description: lesson.description,
      level: lesson.level as VideoLesson['level'],
      topic: lesson.topic,
      transcript: [...transcript].sort((a, b) => a.start - b.start),
    };
  }
}
