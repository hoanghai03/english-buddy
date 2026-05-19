import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BuddyOwlComponent } from '../../shared/buddy-owl';

interface FeatureInfo {
  icon: string;
  name: string;
  desc: string;
  eta: string;
}

const FEATURE_MAP: Record<string, FeatureInfo> = {
  '/messages': {
    icon: '💬',
    name: 'Chat AI',
    desc: 'Trò chuyện tự nhiên với 8 nhân vật AI đến từ các quốc gia khác nhau. Luyện kỹ năng viết và tư duy bằng tiếng Anh mọi lúc, mọi nơi.',
    eta: 'Q3 2026',
  },
  '/call': {
    icon: '📞',
    name: 'Luyện nói',
    desc: 'Gọi điện trực tiếp với AI — nghe giọng bản ngữ, phản hồi tức thì. Phương pháp hiệu quả nhất để cải thiện phát âm và phản xạ nói.',
    eta: 'Q4 2026',
  },
  '/audio': {
    icon: '🎧',
    name: 'Luyện nghe chép',
    desc: 'Nghe từng câu tiếng Anh rồi chép lại chính xác — luyện tai nghe, cải thiện chính tả và phản xạ ngôn ngữ mỗi ngày.',
    eta: 'Q3 2026',
  },
};

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [RouterLink, BuddyOwlComponent],
  templateUrl: './coming-soon.html',
  styleUrl: './coming-soon.css',
})
export class ComingSoonComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);

  menuOpen = signal(false);
  userDropdownOpen = signal(false);

  currentPath = computed(() => '/' + (this.route.snapshot.url[0]?.path ?? ''));

  feature = computed<FeatureInfo>(() => {
    return FEATURE_MAP[this.currentPath()] ?? FEATURE_MAP['/messages'];
  });

  goHome() { this.router.navigate(['/']); }
  goVideo() { this.router.navigate(['/video']); }
  goAudio() { this.router.navigate(['/audio']); }
}
