import { Component, AfterViewInit, Input } from '@angular/core';

@Component({
  selector: 'app-ad-banner',
  template: `
    <div [class]="vertical ? 'ad-wrap-vertical' : 'ad-wrap'">
      <span class="ad-label">Quảng cáo</span>
      <!-- Thay ca-pub-XXXXXXXXXXXXXXXX bằng Publisher ID của bạn -->
      <!-- Thay XXXXXXXXXX (banner) / YYYYYYYYYY (sidebar) bằng Ad Slot ID tương ứng -->
      <ins class="adsbygoogle"
           [style]="'display:block'"
           [attr.data-ad-client]="'ca-pub-XXXXXXXXXXXXXXXX'"
           [attr.data-ad-slot]="vertical ? 'YYYYYYYYYY' : 'XXXXXXXXXX'"
           [attr.data-ad-format]="vertical ? 'vertical' : 'auto'"
           [attr.data-full-width-responsive]="vertical ? 'false' : 'true'">
      </ins>
    </div>
  `,
  styles: [`
    .ad-wrap {
      width: 100%;
      background: #faf5ff;
      border: 1px dashed #d8b4fe;
      border-radius: 12px;
      padding: 8px 16px 12px;
      min-height: 100px;
    }
    .ad-wrap-vertical {
      width: 160px;
      background: #faf5ff;
      border: 1px dashed #d8b4fe;
      border-radius: 12px;
      padding: 8px 8px 12px;
      min-height: 300px;
    }
    .ad-label {
      display: block;
      font-size: 0.7rem;
      color: #a78bfa;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }
  `],
})
export class AdBannerComponent implements AfterViewInit {
  @Input() vertical = false;

  ngAfterViewInit() {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}
  }
}
