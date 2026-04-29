import { Routes } from '@angular/router';

export const LEAVE_BALANCE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./balance-overview/balance-overview').then(m => m.BalanceOverviewComponent) },
];
