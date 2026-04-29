import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { EmployeeService } from '../employee';

@Component({
  selector: 'app-employee-list',
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
  ],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeListComponent {
  readonly auth = inject(Auth);
  private readonly employeeService = inject(EmployeeService);

  readonly employees = computed(() => this.employeeService.getEmployeesForCurrentUser());
  readonly displayedColumns = ['name', 'designation', 'department', 'status', 'actions'];

  getDepartmentName(departmentId: string): string {
    return this.employeeService.getDepartmentName(departmentId);
  }

  deactivate(id: string): void {
    this.employeeService.deactivate(id);
  }
}
