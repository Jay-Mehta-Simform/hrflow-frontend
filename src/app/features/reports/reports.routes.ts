import { Routes } from '@angular/router';

export const REPORT_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) },
  { path: 'leave-summary', loadComponent: () => import('./leave-summary/leave-summary').then(m => m.LeaveSummary) },
  { path: 'absenteeism', loadComponent: () => import('./absenteeism/absenteeism').then(m => m.Absenteeism) },
  { path: 'upcoming-leaves', loadComponent: () => import('./upcoming-leaves/upcoming-leaves').then(m => m.UpcomingLeaves) },
];
