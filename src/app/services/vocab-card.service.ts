import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface VocabCardDto {
  id: string;
  word: string;
  translation: string;
  context: string | null;
  videoLessonId: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class VocabCardService {
  private http = inject(HttpClient);

  getCards(): Promise<VocabCardDto[]> {
    return firstValueFrom(this.http.get<VocabCardDto[]>(`${environment.apiUrl}/vocab-cards`));
  }

  saveCard(word: string, translation: string, context: string | null, videoLessonId: string | null): Promise<VocabCardDto> {
    return firstValueFrom(
      this.http.post<VocabCardDto>(`${environment.apiUrl}/vocab-cards`, { word, translation, context, videoLessonId })
    );
  }

  deleteCard(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${environment.apiUrl}/vocab-cards/${id}`));
  }

  async translate(word: string): Promise<string> {
    try {
      const res = await firstValueFrom(
        this.http.get<any>(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|vi`)
      );
      return res?.responseData?.translatedText ?? '';
    } catch {
      return '';
    }
  }
}
