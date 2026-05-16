import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CharacterService } from '../../services/character.service';
import { AdBannerComponent } from '../../shared/ad-banner';

@Component({
  selector: 'app-home',
  imports: [AdBannerComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
  private characterService = inject(CharacterService);
  private router = inject(Router);

  stats = [
    { value: '8+', label: 'Nhân vật AI' },
    { value: '3', label: 'Cấp độ' },
    { value: '100%', label: 'Miễn phí' },
    { value: '∞', label: 'Cuộc trò chuyện' },
  ];

  features = [
    { icon: '💬', title: 'Chat tự nhiên', desc: 'Nhắn tin với AI như chat với bạn bè thật sự', route: '/messages' },
    { icon: '📞', title: 'Gọi điện AI', desc: 'Luyện kỹ năng nghe nói với giọng nói bản ngữ', route: '/messages' },
    { icon: '🎙️', title: 'Luyện nghe chép', desc: 'Nghe câu tiếng Anh rồi chép lại — luyện tai nghe không cần video', route: '/audio' },
    { icon: '🎯', title: 'Đúng cấp độ', desc: 'Beginner, Intermediate, Advanced — chọn theo trình', route: '/messages' },
  ];

  previews = this.characterService.characters.slice(0, 4);

  start() { this.router.navigate(['/messages']); }
  goVideo() { this.router.navigate(['/video']); }
  goTo(route: string) { this.router.navigate([route]); }
}
