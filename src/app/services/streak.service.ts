import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StreakDto {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

@Injectable({ providedIn: 'root' })
export class StreakService {
  private http = inject(HttpClient);

  getStreak(): Promise<StreakDto> {
    return firstValueFrom(this.http.get<StreakDto>(`${environment.apiUrl}/streaks`));
  }

  checkIn(): Promise<StreakDto> {
    return firstValueFrom(this.http.post<StreakDto>(`${environment.apiUrl}/streaks/check-in`, {}));
  }
}
