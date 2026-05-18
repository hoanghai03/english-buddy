import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-buddy-owl',
  standalone: true,
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 100 100" fill="none"
         [style.display]="'block'"
         [style.transform]="tilt ? 'rotate(' + tilt + 'deg)' : null">
      <!-- body -->
      <ellipse cx="50" cy="58" rx="34" ry="32" fill="#166534"/>
      <ellipse cx="50" cy="64" rx="22" ry="20" fill="#FCE7B5"/>
      <!-- wings -->
      <path d="M18 58 Q14 70 22 80 Q24 70 22 60 Z" fill="#0f4a26"/>
      <path d="M82 58 Q86 70 78 80 Q76 70 78 60 Z" fill="#0f4a26"/>
      <!-- eye whites -->
      <circle cx="38" cy="46" r="11" fill="#FFFAF1"/>
      <circle cx="62" cy="46" r="11" fill="#FFFAF1"/>
      <!-- left pupil -->
      <g [style.transform-origin]="'40px 47px'"
         [style.animation]="blink ? 'buddy-blink 5.2s infinite' : 'none'">
        <circle cx="40" cy="47" r="5" fill="#1C1917"/>
        <circle cx="42" cy="45" r="1.5" fill="#fff"/>
      </g>
      <!-- right pupil -->
      <g [style.transform-origin]="'64px 47px'"
         [style.animation]="blink ? 'buddy-blink 5.2s infinite 0.1s' : 'none'">
        <circle cx="64" cy="47" r="5" fill="#1C1917"/>
        <circle cx="66" cy="45" r="1.5" fill="#fff"/>
      </g>
      <!-- beak -->
      <path d="M50 52 L46 58 L54 58 Z" fill="#F59E0B"/>
      <!-- headphones arc -->
      <path d="M22 38 Q22 22 50 22 Q78 22 78 38" stroke="#1C1917" stroke-width="4" fill="none" stroke-linecap="round"/>
      <rect x="16" y="36" width="10" height="14" rx="4" fill="#1C1917"/>
      <rect x="74" y="36" width="10" height="14" rx="4" fill="#1C1917"/>
      <!-- tufts -->
      <path d="M40 26 L44 18 L46 24 Z" fill="#166534"/>
      <path d="M54 24 L56 18 L60 26 Z" fill="#166534"/>
      <!-- cheeks -->
      <circle cx="30" cy="58" r="3.5" fill="#FB7185" opacity="0.7"/>
      <circle cx="70" cy="58" r="3.5" fill="#FB7185" opacity="0.7"/>
      <!-- feet -->
      <ellipse cx="42" cy="89" rx="4" ry="2.5" fill="#F59E0B"/>
      <ellipse cx="58" cy="89" rx="4" ry="2.5" fill="#F59E0B"/>
    </svg>
  `,
  styles: [':host { display: inline-flex; line-height: 0; }'],
})
export class BuddyOwlComponent {
  @Input() size = 64;
  @Input() blink = true;
  @Input() tilt = 0;
}
