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

  fetch(videoId: string): Observable<TranscriptLine[]> {
    if (this.cache.has(videoId)) return of(this.cache.get(videoId)!);
    return forkJoin({
      en: this.tryGet(videoId, 'en'),
      vi: this.tryGet(videoId, 'en', undefined, 'vi'),
    }).pipe(
      map(({ en, vi }) => {
        const lines = this.merge(en, vi);
        this.cache.set(videoId, lines);
        return lines;
      })
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
        if (res?.events?.length) return of(res);
        return this.ytGet(videoId, lang, 'asr', tlang);
      }),
      catchError(() => this.ytGet(videoId, lang, 'asr', tlang).pipe(
        catchError(() => of(null))
      ))
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
    return en.map((line, i) => ({
      start: line.start,
      end: line.end,
      en: line.text,
      vi: vi[i]?.text ?? '',
    }));
  }
}
