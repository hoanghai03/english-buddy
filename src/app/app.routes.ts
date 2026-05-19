import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.RegisterComponent) },
  { path: 'messages', loadComponent: () => import('./pages/coming-soon/coming-soon').then(m => m.ComingSoonComponent) },
  { path: 'call', loadComponent: () => import('./pages/coming-soon/coming-soon').then(m => m.ComingSoonComponent) },
  { path: 'video', loadComponent: () => import('./pages/video/video').then(m => m.VideoComponent) },
  { path: 'audio', loadComponent: () => import('./pages/coming-soon/coming-soon').then(m => m.ComingSoonComponent) },
  { path: 'admin', loadComponent: () => import('./pages/admin/admin').then(m => m.AdminComponent), canActivate: [adminGuard] },
  { path: '**', redirectTo: '' },
];
