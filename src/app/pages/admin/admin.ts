import { Component, inject, signal, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

declare const Chart: any;

interface DashboardStats {
  totalViews: number;
  todayViews: number;
  totalUsers: number;
  topPages: { path: string; count: number }[];
  last7Days: { date: string; count: number }[];
  recentActivity: RecentActivity[];
}

interface RecentActivity {
  path: string;
  ipAddress: string | null;
  country: string | null;
  city: string | null;
  browser: string | null;
  os: string | null;
  occurredAt: string;
  username: string | null;
}

interface UserAdmin {
  id: string;
  email: string | null;
  username: string;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
}

@Component({
  selector: 'app-admin',
  imports: [RouterLink, DecimalPipe, DatePipe, NgClass, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;

  private http = inject(HttpClient);
  auth = inject(AuthService);

  activeTab = signal<'overview' | 'users'>('overview');
  stats = signal<DashboardStats | null>(null);
  users = signal<UserAdmin[]>([]);
  loading = signal(true);
  usersLoading = signal(false);
  error = signal<string | null>(null);
  updatingRole = signal<string | null>(null);

  private chart: any = null;

  ngOnInit() {
    this.loadDashboard();
  }

  ngAfterViewInit() {
    if (this.stats()) this.renderChart();
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  setTab(tab: 'overview' | 'users') {
    this.activeTab.set(tab);
    if (tab === 'users' && this.users().length === 0) this.loadUsers();
  }

  loadDashboard() {
    this.loading.set(true);
    this.http.get<DashboardStats>(`${environment.apiUrl}/admin/dashboard`).subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
        setTimeout(() => this.renderChart(), 0);
      },
      error: () => { this.error.set('Không thể tải dữ liệu dashboard'); this.loading.set(false); },
    });
  }

  loadUsers() {
    this.usersLoading.set(true);
    this.http.get<UserAdmin[]>(`${environment.apiUrl}/admin/users`).subscribe({
      next: (data) => { this.users.set(data); this.usersLoading.set(false); },
      error: () => { this.usersLoading.set(false); },
    });
  }

  updateRole(user: UserAdmin, newRole: string) {
    if (user.id === this.auth.currentUser()?.id) return;
    this.updatingRole.set(user.id);
    this.http.put(`${environment.apiUrl}/admin/users/${user.id}/role`, { role: newRole }).subscribe({
      next: () => {
        this.users.update(list => list.map(u => u.id === user.id ? { ...u, role: newRole } : u));
        this.updatingRole.set(null);
      },
      error: () => { this.updatingRole.set(null); },
    });
  }

  private renderChart() {
    const data = this.stats();
    if (!data || !this.chartCanvas) return;

    this.chart?.destroy();
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: data.last7Days.map(d => d.date),
        datasets: [{
          label: 'Lượt truy cập',
          data: data.last7Days.map(d => d.count),
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: '#6366f1',
          borderWidth: 1,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } },
          x: { grid: { display: false } },
        },
      },
    });
  }

  locationLabel(a: RecentActivity): string {
    if (a.city && a.country) return `${a.city}, ${a.country}`;
    if (a.country) return a.country;
    return a.ipAddress ?? '—';
  }
}
