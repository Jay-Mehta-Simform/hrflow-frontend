import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { Department } from '../../../shared/interfaces/department.interface';
import { InMemoryData } from '../../../store/in-memory-data';
import { EmployeeService } from '../employee';

@Component({
  selector: 'app-employee-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
  ],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeFormComponent implements OnInit {
  private readonly dataService = inject(InMemoryData);
  private readonly employeeService = inject(EmployeeService);
  private readonly auth = inject(Auth);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    designation: ['', Validators.required],
    departmentId: ['', Validators.required],
    joiningDate: [null as Date | null, Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // ⚠️ BUG-10: all departments shown including deactivated ones
  readonly departments = signal<Department[]>([]);

  ngOnInit(): void {
    // BUG-10: should filter with .filter(d => d.isActive)
    this.departments.set(this.dataService.departments);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.employeeService.create({
      userId: this.dataService.generateId(),
      firstName: v.firstName!,
      lastName: v.lastName!,
      designation: v.designation!,
      departmentId: v.departmentId!,
      managerId: null,
      joiningDate: v.joiningDate ? (v.joiningDate as Date).toISOString().split('T')[0] : '',
      isActive: true,
    });
    this.router.navigate(['/employees']);
  }
}
