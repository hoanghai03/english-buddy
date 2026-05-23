import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SentenceAnalysis {
  translation: string;
  grammar: string;
  examples: string[];
}

@Injectable({ providedIn: 'root' })
export class SentenceAnalysisService {
  private http = inject(HttpClient);

  analyze(sentence: string): Promise<SentenceAnalysis> {
    return firstValueFrom(
      this.http.post<SentenceAnalysis>(`${environment.apiUrl}/ai/analyze-sentence`, { sentence })
    );
  }
}
