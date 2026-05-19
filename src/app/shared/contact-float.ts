import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-float',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cf-wrap">

      @if (open()) {
        <div class="cf-backdrop" (click)="open.set(false)"></div>
      }

      <!-- Contact options -->
      <div class="cf-options" [class.visible]="open()">

        <!-- Facebook -->
        <a
          class="cf-item cf-facebook"
          href="https://www.facebook.com/profile.php?id=61590179091278"
          target="_blank"
          rel="noopener noreferrer"
          title="Nhắn tin Facebook"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
          </svg>
          <span class="cf-label">Facebook</span>
        </a>

        <!-- Zalo -->
        <a
          class="cf-item cf-zalo"
          href="https://zalo.me/0362533497"
          target="_blank"
          rel="noopener noreferrer"
          title="Nhắn tin Zalo"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.306A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm-3.5 7h-1V13h1V9zm.5 0h1v2.5L12 9h1v4h-1v-2.5L10 13H9V9zm5.5 0h-2.5v4H15v-1h-1.5v-.75H15v-1h-1.5V10H15V9z"/>
          </svg>
          <span class="cf-label">Zalo</span>
        </a>

      </div>

      <!-- Trigger button -->
      <button class="cf-trigger" (click)="open.set(!open())" [class.active]="open()" title="Liên hệ hỗ trợ" aria-label="Liên hệ hỗ trợ">
        @if (open()) {
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        } @else {
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        }
      </button>

    </div>
  `,
  styles: [`
    .cf-wrap {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
    }

    .cf-backdrop {
      position: fixed;
      inset: 0;
      z-index: -1;
    }

    .cf-options {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
      opacity: 0;
      transform: translateY(12px) scale(0.95);
      pointer-events: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .cf-options.visible {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    .cf-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 4px 16px rgba(0,0,0,0.18);
      transition: transform 0.15s, box-shadow 0.15s;
      white-space: nowrap;
      font-family: inherit;
    }
    .cf-item:hover {
      transform: translateX(-3px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.22);
    }

    .cf-facebook {
      background: #1877f2;
      color: #fff;
    }

    .cf-zalo {
      background: #0068ff;
      color: #fff;
    }

    .cf-trigger {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #f59e0b;
      border: 2.5px solid #1a1a1a;
      color: #1a1a1a;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 18px rgba(0,0,0,0.22), 4px 4px 0 #1a1a1a;
      transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
    }
    .cf-trigger:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 22px rgba(0,0,0,0.26), 4px 4px 0 #1a1a1a;
    }
    .cf-trigger.active {
      background: #fee2e2;
      box-shadow: 0 4px 18px rgba(0,0,0,0.18), 4px 4px 0 #1a1a1a;
    }

    @media (max-width: 640px) {
      .cf-wrap {
        bottom: 80px;
        right: 16px;
      }
      .cf-label {
        display: none;
      }
      .cf-item {
        padding: 11px;
        border-radius: 50%;
      }
    }
  `]
})
export class ContactFloatComponent {
  open = signal(false);
}
