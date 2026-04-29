import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from './core/services/auth';
import { UserRole } from './shared/interfaces/user.interface';
import { Seed } from './store/seed';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'bar_chart', route: '/reports', roles: ['hr_admin'] },
  { label: 'Employees', icon: 'people', route: '/employees', roles: ['hr_admin', 'manager'] },
  { label: 'Departments', icon: 'business', route: '/departments', roles: ['hr_admin'] },
  {
    label: 'My Balance',
    icon: 'event_available',
    route: '/leave-balance',
    roles: ['hr_admin', 'manager', 'employee'],
  },
  {
    label: 'Leave Requests',
    icon: 'assignment',
    route: '/leave-requests',
    roles: ['hr_admin', 'manager', 'employee'],
  },
  {
    label: 'Team Calendar',
    icon: 'calendar_month',
    route: '/calendar',
    roles: ['hr_admin', 'manager'],
  },
  { label: 'Reports', icon: 'summarize', route: '/reports/leave-summary', roles: ['hr_admin'] },
];

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressBarModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly seedService = inject(Seed);
  readonly auth = inject(Auth);

  readonly sidenavOpen = signal(true);

  readonly navItems = computed(() => {
    const role = this.auth.userRole();
    if (!role) return [];
    return NAV_ITEMS.filter((item) => item.roles.includes(role));
  });

  ngOnInit(): void {
    this.seedService.seed();
  }

  toggleSidenav(): void {
    this.sidenavOpen.update((v) => !v);
  }
}
