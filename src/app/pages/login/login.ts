import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const w = window as any;

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  @ViewChild('googleBtn') googleBtnRef?: ElementRef<HTMLDivElement>;

  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  showPassword = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    if (this.auth.isLoggedIn()) this.router.navigate(['/']);
  }

  ngAfterViewInit() {
    this.initGoogle();
    this.initFacebook();
  }

  private initGoogle() {
    const load = () => {
      w.google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (res: { credential: string }) => this.oauthLogin('google', res.credential),
      });
      w.google.accounts.id.renderButton(this.googleBtnRef!.nativeElement, {
        theme: 'outline', size: 'large', width: 320, text: 'signin_with', shape: 'rectangular',
      });
    };

    if (w.google) { load(); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = load;
    document.head.appendChild(script);
  }

  private initFacebook() {
    if (w.FB) return;
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.onload = () => w.FB.init({ appId: environment.facebookAppId, version: 'v18.0', cookie: true, xfbml: true });
    document.head.appendChild(script);
  }

  loginFacebook() {
    if (!w.FB) { this.error.set('Facebook SDK chưa sẵn sàng, thử lại sau giây lát.'); return; }
    w.FB.login((res: any) => {
      if (res.authResponse?.accessToken) {
        this.oauthLogin('facebook', res.authResponse.accessToken);
      }
    }, { scope: 'email' });
  }

  private oauthLogin(provider: 'google' | 'facebook', token: string) {
    this.loading.set(true);
    this.error.set(null);
    this.auth.oauthLogin({ provider, token }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (e) => { this.error.set(e.error?.message ?? 'Đăng nhập thất bại'); this.loading.set(false); },
    });
  }

  submit() {
    if (!this.email.trim() || !this.password) return;
    this.loading.set(true);
    this.error.set(null);
    this.auth.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (e) => { this.error.set(e.error?.message ?? 'Email hoặc mật khẩu không đúng'); this.loading.set(false); },
    });
  }

  ngOnDestroy() {}
}
