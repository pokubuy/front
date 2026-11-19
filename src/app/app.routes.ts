import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    pathMatch: 'full',
    redirectTo: 'auth/login',
  },
  {
    path: 'auth/login',
    title: 'Вход — Pokubuy',
    data: { registration: false },
    loadComponent: () => import('./components/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'auth/register',
    title: 'Регистрация — Pokubuy',
    data: { registration: true },
    loadComponent: () => import('./components/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: '',
    pathMatch: 'full',
    title: 'Pokubuy — цифровое для твоей жизни',
    loadComponent: () => import('./components/home/home.component').then((m) => m.HomeComponent),
  },
];
