import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/reports', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'employees',
        canActivate: [roleGuard],
        data: { roles: ['hr_admin', 'manager'] },
        loadChildren: () =>
          import('./features/employees/employees.routes').then((m) => m.EMPLOYEE_ROUTES),
      },
      {
        path: 'departments',
        canActivate: [roleGuard],
        data: { roles: ['hr_admin'] },
        loadChildren: () =>
          import('./features/departments/departments.routes').then((m) => m.DEPARTMENT_ROUTES),
      },
      {
        path: 'leave-balance',
        loadChildren: () =>
          import('./features/leave-balance/leave-balance.routes').then(
            (m) => m.LEAVE_BALANCE_ROUTES,
          ),
      },
      {
        path: 'leave-requests',
        loadChildren: () =>
          import('./features/leave-requests/leave-requests.routes').then(
            (m) => m.LEAVE_REQUEST_ROUTES,
          ),
      },
      {
        path: 'calendar',
        canActivate: [roleGuard],
        data: { roles: ['hr_admin', 'manager'] },
        loadChildren: () =>
          import('./features/calendar/calendar.routes').then((m) => m.CALENDAR_ROUTES),
      },
      {
        path: 'reports',
        canActivate: [roleGuard],
        data: { roles: ['hr_admin'] },
        loadChildren: () =>
          import('./features/reports/reports.routes').then((m) => m.REPORT_ROUTES),
      },
    ],
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./features/auth/unauthorized/unauthorized').then((m) => m.UnauthorizedComponent),
  },
  { path: '**', redirectTo: '/reports' },
];
