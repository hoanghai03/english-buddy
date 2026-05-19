import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { VideoLesson } from '../models/lesson.model';

export interface SavedVideoDto {
  lesson: {
    id: string; videoId: string; title: string; description: string;
    level: string; topic: string; lang: string; transcriptCount: number;
  };
  savedAt: string;
}

@Injectable({ providedIn: 'root' })
export class SavedVideoService {
  private http = inject(HttpClient);

  getSaved(): Promise<SavedVideoDto[]> {
    return firstValueFrom(this.http.get<SavedVideoDto[]>(`${environment.apiUrl}/saved-videos`));
  }

  isSaved(videoLessonId: string): Promise<{ saved: boolean }> {
    return firstValueFrom(this.http.get<{ saved: boolean }>(`${environment.apiUrl}/saved-videos/${videoLessonId}/check`));
  }

  save(videoLessonId: string): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${environment.apiUrl}/saved-videos/${videoLessonId}`, {}));
  }

  unsave(videoLessonId: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${environment.apiUrl}/saved-videos/${videoLessonId}`));
  }
}
