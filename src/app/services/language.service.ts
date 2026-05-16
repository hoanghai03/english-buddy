import { Injectable, signal } from '@angular/core';
import { TRANSLATIONS, Lang } from '../i18n/translations';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly langs: { code: Lang; label: string; flag: string }[] = [
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
  ];

  readonly current = signal<Lang>((localStorage.getItem('app_lang') as Lang) ?? 'vi');

  set(lang: Lang) {
    this.current.set(lang);
    localStorage.setItem('app_lang', lang);
  }

  t(key: string): string {
    return TRANSLATIONS[this.current()][key] ?? key;
  }
}
