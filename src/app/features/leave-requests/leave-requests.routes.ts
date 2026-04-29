import { Routes } from '@angular/router';

export const LEAVE_REQUEST_ROUTES: Routes = [
  { path: '', redirectTo: 'my-leaves', pathMatch: 'full' },
  { path: 'apply', loadComponent: () => import('./apply-leave/apply-leave').then(m => m.ApplyLeave) },
  { path: 'my-leaves', loadComponent: () => import('./my-leaves/my-leaves').then(m => m.MyLeaves) },
  { path: 'approval-queue', loadComponent: () => import('./approval-queue/approval-queue').then(m => m.ApprovalQueue) },
  { path: ':id', loadComponent: () => import('./leave-detail/leave-detail').then(m => m.LeaveDetail) },
];
