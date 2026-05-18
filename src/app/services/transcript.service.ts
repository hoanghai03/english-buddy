import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, switchMap } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TranscriptLine } from '../models/lesson.model';
import { environment } from '../../environments/environment';

const PROXY = environment.proxyUrl;

@Injectable({ providedIn: 'root' })
export class TranscriptService {
  private http = inject(HttpClient);
  private cache = new Map<string, TranscriptLine[]>();

  fetch(videoId: string, videoLang = 'en'): Observable<TranscriptLine[]> {
    const key = `${videoId}:${videoLang}`;
    if (this.cache.has(key)) return of(this.cache.get(key)!);

    // Fetch EN (manual → ASR fallback) and VI (manual only) in parallel
    return forkJoin([
      this.tryGet(videoId, 'en'),
      this.ytGet(videoId, 'vi'),
    ]).pipe(
      switchMap(([enData, viData]) => {
        const lines = this.merge(enData, viData);
        if (lines.length) {
          this.cache.set(key, lines);
          return of(lines);
        }
        // English failed — try video's native language with translation to EN
        if (videoLang && videoLang !== 'en') {
          return this.tryGetTranslated(videoId, videoLang).pipe(
            map(l => { this.cache.set(key, l); return l; })
          );
        }
        this.cache.set(key, []);
        return of([]);
      })
    );
  }

  // Thử lấy caption ngôn ngữ gốc của video rồi dịch sang tiếng Anh qua tlang=en
  private tryGetTranslated(videoId: string, srcLang: string): Observable<TranscriptLine[]> {
    return this.ytGet(videoId, srcLang, undefined, 'en').pipe(
      switchMap((res: any) => {
        if (!res) return of(null);
        if (res.events?.length) return of(res);
        return this.ytGet(videoId, srcLang, 'asr', 'en');
      }),
      map(data => this.merge(data, null))
    );
  }

  fetchTitle(videoId: string): Observable<string> {
    return this.http.get<{ title: string }>(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    ).pipe(
      map(r => r.title),
      catchError(() => of('Video YouTube'))
    );
  }

  // Thử manual captions trước, fallback sang auto-generated (kind=asr)
  private tryGet(videoId: string, lang: string, kind?: string, tlang?: string): Observable<any> {
    return this.ytGet(videoId, lang, kind, tlang).pipe(
      switchMap((res: any) => {
        if (!res) return of(null);             // Request thất bại (429/lỗi) → không thử lại
        if (res.events?.length) return of(res); // Có dữ liệu → dùng luôn
        return this.ytGet(videoId, lang, 'asr', tlang); // Events rỗng → thử ASR
      })
    );
  }

  private ytGet(videoId: string, lang: string, kind?: string, tlang?: string): Observable<any> {
    let url = `${PROXY}/api/timedtext?v=${videoId}&fmt=json3&lang=${lang}`;
    if (kind) url += `&kind=${kind}`;
    if (tlang) url += `&tlang=${tlang}`;
    return this.http.get<any>(url).pipe(catchError(() => of(null)));
  }

  private parseEvents(data: any): { start: number; end: number; text: string }[] {
    if (!data?.events) return [];
    return data.events
      .filter((e: any) => e.segs?.length)
      .map((e: any) => ({
        start: e.tStartMs / 1000,
        end: (e.tStartMs + (e.dDurationMs ?? 2000)) / 1000,
        text: e.segs.map((s: any) => s.utf8 ?? '').join('').replace(/\n/g, ' ').trim(),
      }))
      .filter((l: any) => l.text);
  }

  private merge(enData: any, viData: any): TranscriptLine[] {
    const en = this.parseEvents(enData);
    const vi = this.parseEvents(viData);
    return en.map(enLine => {
      // Match by time overlap instead of index (EN and VI may have different segment counts)
      const match = vi.find(v => v.start < enLine.end && v.end > enLine.start);
      return {
        start: enLine.start,
        end: enLine.end,
        en: enLine.text,
        vi: match?.text ?? '',
      };
    });
  }
}
