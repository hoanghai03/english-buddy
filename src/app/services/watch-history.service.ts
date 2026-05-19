import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WatchHistoryDto {
  lesson: {
    id: string; videoId: string; title: string; description: string;
    level: string; topic: string; lang: string; transcriptCount: number;
  };
  positionSeconds: number;
  watchedAt: string;
}

@Injectable({ providedIn: 'root' })
export class WatchHistoryService {
  private http = inject(HttpClient);

  getHistory(): Promise<WatchHistoryDto[]> {
    return firstValueFrom(this.http.get<WatchHistoryDto[]>(`${environment.apiUrl}/watch-history`));
  }

  getPosition(videoLessonId: string): Promise<{ positionSeconds: number } | null> {
    return firstValueFrom(
      this.http.get<{ positionSeconds: number }>(`${environment.apiUrl}/watch-history/${videoLessonId}/position`)
    ).catch(() => null);
  }

  savePosition(videoLessonId: string, positionSeconds: number): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${environment.apiUrl}/watch-history/${videoLessonId}`, { positionSeconds })
    );
  }
}
