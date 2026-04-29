import { Routes } from '@angular/router';

export const CALENDAR_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./team-calendar/team-calendar').then(m => m.TeamCalendar) },
  { path: 'public-holidays', loadComponent: () => import('./public-holidays/public-holidays').then(m => m.PublicHolidays) },
];
