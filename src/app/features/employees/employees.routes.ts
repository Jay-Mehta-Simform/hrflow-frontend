import { Routes } from '@angular/router';

export const EMPLOYEE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./employee-list/employee-list').then(m => m.EmployeeListComponent) },
  { path: 'new', loadComponent: () => import('./employee-form/employee-form').then(m => m.EmployeeFormComponent) },
  { path: ':id', loadComponent: () => import('./employee-detail/employee-detail').then(m => m.EmployeeDetail) },
  { path: ':id/edit', loadComponent: () => import('./employee-form/employee-form').then(m => m.EmployeeFormComponent) },
];
