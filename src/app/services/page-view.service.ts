import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PageViewService {
  private http = inject(HttpClient);
  private router = inject(Router);

  init() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e) => {
      const path = (e as NavigationEnd).urlAfterRedirects;
      this.http.post(`${environment.apiUrl}/pageviews`, { path }).subscribe({ error: () => {} });
    });
  }
}
