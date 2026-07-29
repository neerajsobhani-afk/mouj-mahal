import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
    canActivate: [noAuthGuard],
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./pages/tabs/tabs.routes').then((m) => m.routes),
    canActivate: [authGuard],
  },
  {
    path: 'scan-result',
    redirectTo: 'tabs/scan-result',
    pathMatch: 'full',
  },
  {
    path: 'home',
    redirectTo: 'tabs/dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
 
];