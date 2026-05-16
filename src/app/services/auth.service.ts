import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, OAuthLoginRequest, RegisterRequest, UserDto } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<UserDto | null>(this.loadUser());
  isLoggedIn = computed(() => this.currentUser() !== null);

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  login(req: LoginRequest): Observable<void> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, req).pipe(
      tap(res => this.saveSession(res)),
      map(() => void 0),
    );
  }

  register(req: RegisterRequest): Observable<void> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, req).pipe(
      tap(res => this.saveSession(res)),
      map(() => void 0),
    );
  }

  oauthLogin(req: OAuthLoginRequest): Observable<void> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/oauth`, req).pipe(
      tap(res => this.saveSession(res)),
      map(() => void 0),
    );
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh');
    localStorage.removeItem('auth_user');
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  private saveSession(res: AuthResponse) {
    localStorage.setItem('auth_token', res.accessToken);
    localStorage.setItem('auth_refresh', res.refreshToken);
    localStorage.setItem('auth_user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  private loadUser(): UserDto | null {
    try {
      const raw = localStorage.getItem('auth_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
