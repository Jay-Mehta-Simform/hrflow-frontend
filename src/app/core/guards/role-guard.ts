import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../../shared/interfaces/user.interface';
import { Auth } from '../services/auth';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const requiredRoles: UserRole[] = route.data['roles'] ?? [];

  if (!requiredRoles.length) return true;

  const userRole = auth.userRole();
  if (!userRole || !requiredRoles.includes(userRole)) {
    return router.createUrlTree(['/unauthorized']);
  }

  return true;
};
