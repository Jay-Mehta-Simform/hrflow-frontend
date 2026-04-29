import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Auth } from '../../../core/services/auth';
import { InMemoryData } from '../../../store/in-memory-data';
import { DepartmentService } from '../department';

@Component({
  selector: 'app-department-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
  ],
  templateUrl: './department-list.html',
  styleUrl: './department-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentListComponent {
  readonly auth = inject(Auth);
  private readonly deptService = inject(DepartmentService);
  private readonly dataService = inject(InMemoryData);

  readonly departments = computed(() => this.dataService.departments);
  readonly displayedColumns = ['name', 'description', 'status', 'actions'];

  getEmployeeCount(deptId: string): number {
    return this.dataService.employees.filter((e) => e.departmentId === deptId && e.isActive).length;
  }

  deactivate(id: string): void {
    this.deptService.deactivate(id);
  }
}
