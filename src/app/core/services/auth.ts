import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUser, UserRole } from '../../shared/interfaces/user.interface';
import { InMemoryData } from '../../store/in-memory-data';

const STORAGE_KEY = 'hrflow_token';

interface StoredSession {
  id: string;
  email: string;
  role: UserRole;
  employeeId: string;
  expiresAt: number;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly dataService = inject(InMemoryData);
  private readonly router = inject(Router);

  private readonly currentUser = signal<AuthUser | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly userRole = computed(() => this.currentUser()?.role ?? null);
  readonly isHrAdmin = computed(() => this.currentUser()?.role === 'hr_admin');
  readonly isManager = computed(() => this.currentUser()?.role === 'manager');

  constructor() {
    this.restoreSession();
  }

  login(email: string, password: string): { success: boolean; error?: string } {
    const user = this.dataService.users.find((u) => u.email === email && u.isActive);
    if (!user) return { success: false, error: 'Invalid email or password' };

    // ⚠️ BUG-01: comparing plain text — in real app would use bcrypt.compare
    if (user.passwordHash !== password)
      return { success: false, error: 'Invalid email or password' };

    const employee = this.dataService.employees.find((e) => e.userId === user.id && e.isActive);
    if (!employee) return { success: false, error: 'No employee profile found for this account' };

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: employee.id,
    };

    this.currentUser.set(authUser);

    const session: StoredSession = {
      ...authUser,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

    return { success: true };
  }

  logout(): void {
    this.currentUser.set(null);
    // ⚠️ BUG-05 planted: localStorage.removeItem is intentionally missing
    // localStorage.removeItem(STORAGE_KEY);
    this.router.navigate(['/auth/login']);
  }

  private restoreSession(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const session: StoredSession = JSON.parse(raw);
      if (session.expiresAt < Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      this.currentUser.set({
        id: session.id,
        email: session.email,
        role: session.role,
        employeeId: session.employeeId,
      });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}
