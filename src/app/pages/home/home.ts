import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CharacterService } from '../../services/character.service';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';
import { AdBannerComponent } from '../../shared/ad-banner';

@Component({
  selector: 'app-home',
  imports: [AdBannerComponent, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
  private characterService = inject(CharacterService);
  private router = inject(Router);
  lang = inject(LanguageService);
  auth = inject(AuthService);

  stats = computed(() => [
    { value: '8+', label: this.lang.t('stat_chars') },
    { value: '3', label: this.lang.t('stat_levels') },
    { value: '100%', label: this.lang.t('stat_free') },
    { value: '∞', label: this.lang.t('stat_convos') },
  ]);

  features = computed(() => [
    { icon: '💬', title: this.lang.t('feat1_title'), desc: this.lang.t('feat1_desc'), route: '/messages' },
    { icon: '📞', title: this.lang.t('feat2_title'), desc: this.lang.t('feat2_desc'), route: '/messages' },
    { icon: '🎙️', title: this.lang.t('feat3_title'), desc: this.lang.t('feat3_desc'), route: '/audio' },
    { icon: '🎯', title: this.lang.t('feat4_title'), desc: this.lang.t('feat4_desc'), route: '/messages' },
  ]);

  previews = this.characterService.characters.slice(0, 4);
  menuOpen = signal(false);

  start() { this.router.navigate(['/video']); }
  goVideo() { this.router.navigate(['/video']); }
  goTo(route: string) { this.router.navigate([route]); }
}
