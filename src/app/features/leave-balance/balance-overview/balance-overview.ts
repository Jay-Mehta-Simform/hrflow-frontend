import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Auth } from '../../../core/services/auth';
import { InMemoryData } from '../../../store/in-memory-data';

interface BalanceCard {
  leaveTypeName: string;
  totalAllocated: number;
  carryForward: number;
  used: number;
  remaining: number;
}

@Component({
  selector: 'app-balance-overview',
  imports: [CommonModule, MatCardModule, MatProgressBarModule, MatDividerModule],
  templateUrl: './balance-overview.html',
  styleUrl: './balance-overview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalanceOverviewComponent {
  private readonly dataService = inject(InMemoryData);
  private readonly auth = inject(Auth);

  readonly currentYear = new Date().getFullYear();

  readonly balanceCards = computed<BalanceCard[]>(() => {
    const user = this.auth.user();
    if (!user) return [];

    const balances = this.dataService.leaveBalances.filter(
      (b) => b.employeeId === user.employeeId && b.year === this.currentYear,
    );

    return balances.map((b) => {
      const leaveType = this.dataService.leaveTypes.find((lt) => lt.id === b.leaveTypeId);
      return {
        leaveTypeName: leaveType?.name ?? 'Unknown',
        totalAllocated: b.totalAllocated,
        carryForward: b.carryForward,
        used: this.calculateUsedDays(user.employeeId, b.leaveTypeId),
        remaining:
          b.totalAllocated +
          b.carryForward -
          this.calculateUsedDays(user.employeeId, b.leaveTypeId),
      };
    });
  });

  // ⚠️ BUG-15: counts raw calendar days including weekends instead of workingDays
  private calculateUsedDays(employeeId: string, leaveTypeId: string): number {
    return this.dataService.leaveRequests
      .filter(
        (r) =>
          r.employeeId === employeeId && r.leaveTypeId === leaveTypeId && r.status === 'approved',
      )
      .reduce((sum, r) => {
        // BUG-15: should be sum + r.workingDays
        const from = new Date(r.fromDate);
        const to = new Date(r.toDate);
        const days = (to.getTime() - from.getTime()) / 86400000 + 1;
        return sum + days;
      }, 0);
  }

  getUsagePercent(card: BalanceCard): number {
    const total = card.totalAllocated + card.carryForward;
    if (total === 0) return 0;
    return Math.min(100, (card.used / total) * 100);
  }
}
