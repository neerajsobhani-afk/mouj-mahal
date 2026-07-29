import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard to prevent unauthenticated users from accessing protected routes.
 * If the user is not logged in, redirect them to the login page.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // User is not logged in -> redirect to login page
  return router.createUrlTree(['/login']);
};

/**
 * Guard to prevent logged-in users from accessing the login page.
 * If the user is logged in, redirect them to the main dashboard.
 */
export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  // User is already logged in -> redirect to main dashboard
  return router.createUrlTree(['/tabs/dashboard']);
};
