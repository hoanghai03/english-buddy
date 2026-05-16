import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AudioLesson } from '../models/audio-lesson.model';
import { environment } from '../../environments/environment';

interface ApiLessonSummary {
  id: string;
  title: string;
  description: string;
  level: string;
  topic: string;
  lineCount: number;
}

interface ApiLessonDetail {
  id: string;
  title: string;
  description: string;
  level: string;
  topic: string;
  lineCount: number;
  lines: { index: number; english: string; vietnamese: string }[];
}

@Injectable({ providedIn: 'root' })
export class AudioLessonService {
  private http = inject(HttpClient);

  readonly lessons = signal<AudioLesson[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async loadLessons(level?: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const url = level
        ? `${environment.apiUrl}/audio-lessons?level=${level}`
        : `${environment.apiUrl}/audio-lessons`;

      const summaries = await firstValueFrom(this.http.get<ApiLessonSummary[]>(url));

      // Summaries không có lines — chuyển thành AudioLesson với lines rỗng
      // Lines sẽ được load khi user chọn bài cụ thể
      this.lessons.set(summaries.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description,
        level: s.level as AudioLesson['level'],
        topic: s.topic,
        lines: [],
        lineCount: s.lineCount,
      })));
    } catch {
      this.error.set('Không thể tải danh sách bài. Vui lòng thử lại.');
    } finally {
      this.loading.set(false);
    }
  }

  async loadLessonDetail(id: string): Promise<AudioLesson | null> {
    try {
      const detail = await firstValueFrom(
        this.http.get<ApiLessonDetail>(`${environment.apiUrl}/audio-lessons/${id}`)
      );
      return {
        id: detail.id,
        title: detail.title,
        description: detail.description,
        level: detail.level as AudioLesson['level'],
        topic: detail.topic,
        lineCount: detail.lineCount,
        lines: detail.lines
          .sort((a, b) => a.index - b.index)
          .map(l => ({ en: l.english, vi: l.vietnamese })),
      };
    } catch {
      return null;
    }
  }
}
