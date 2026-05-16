import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.RegisterComponent) },
  { path: 'messages', loadComponent: () => import('./pages/chat/chat').then(m => m.ChatComponent) },
  { path: 'call', loadComponent: () => import('./pages/call/call').then(m => m.CallComponent) },
  { path: 'video', loadComponent: () => import('./pages/video/video').then(m => m.VideoComponent) },
  { path: 'audio', loadComponent: () => import('./pages/audio/audio').then(m => m.AudioComponent) },
  { path: '**', redirectTo: '' },
];
