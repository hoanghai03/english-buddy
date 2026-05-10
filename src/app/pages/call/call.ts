import { Component, computed, signal, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { CharacterService } from '../../services/character.service';

@Component({
  selector: 'app-call',
  imports: [NgClass],
  templateUrl: './call.html',
  styleUrl: './call.css',
})
export class CallComponent implements OnInit, OnDestroy {
  character = computed(() => this.characterService.selectedCharacter());
  seconds = signal(0);
  muted = signal(false);
  speakerOn = signal(true);
  callActive = signal(false);
  status = signal<'connecting' | 'active' | 'ended'>('connecting');

  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private characterService: CharacterService, private router: Router) {
    if (!this.character()) { this.router.navigate(['/']); }
  }

  ngOnInit() {
    setTimeout(() => {
      this.status.set('active');
      this.callActive.set(true);
      this.timer = setInterval(() => this.seconds.update(s => s + 1), 1000);
    }, 2000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  toggleMute() { this.muted.update(v => !v); }
  toggleSpeaker() { this.speakerOn.update(v => !v); }

  endCall() {
    this.status.set('ended');
    this.callActive.set(false);
    if (this.timer) clearInterval(this.timer);
    setTimeout(() => this.router.navigate(['/']), 1500);
  }

  goToChat() { this.router.navigate(['/messages']); }

  get duration(): string {
    const m = Math.floor(this.seconds() / 60).toString().padStart(2, '0');
    const s = (this.seconds() % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
