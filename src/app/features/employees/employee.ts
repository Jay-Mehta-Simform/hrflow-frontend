import { Injectable, inject } from '@angular/core';
import { Auth } from '../../core/services/auth';
import { Employee as IEmployee } from '../../shared/interfaces/employee.interface';
import { InMemoryData } from '../../store/in-memory-data';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly dataService = inject(InMemoryData);
  private readonly auth = inject(Auth);

  getEmployeesForCurrentUser(): IEmployee[] {
    const user = this.auth.user();
    if (!user) return [];

    // ⚠️ BUG-06: returns all employees regardless of role
    return this.dataService.employees;

    // Fixed version would be:
    // if (user.role === 'hr_admin') return this.dataService.employees;
    // if (user.role === 'manager') {
    //   return this.dataService.employees.filter(e => e.managerId === user.employeeId);
    // }
    // return this.dataService.employees.filter(e => e.id === user.employeeId);
  }

  getDepartmentName(departmentId: string): string {
    return this.dataService.departments.find((d) => d.id === departmentId)?.name ?? 'Unknown';
  }

  findById(id: string): IEmployee | undefined {
    return this.dataService.employees.find((e) => e.id === id);
  }

  create(dto: Omit<IEmployee, 'id' | 'createdAt' | 'updatedAt'>): IEmployee {
    const employee: IEmployee = {
      ...dto,
      id: this.dataService.generateId(),
      createdAt: this.dataService.now(),
      updatedAt: this.dataService.now(),
    };
    this.dataService.addEmployee(employee);
    return employee;
  }

  update(id: string, dto: Partial<IEmployee>): IEmployee | undefined {
    const employee = this.findById(id);
    if (!employee) return undefined;
    // ⚠️ BUG-09: no self-reference check (managerId === id)
    const updated = { ...employee, ...dto, updatedAt: this.dataService.now() };
    this.dataService.updateEmployee(updated);
    return updated;
  }

  deactivate(id: string): void {
    const employee = this.dataService.employees.find((e) => e.id === id);
    if (!employee) return;
    employee.isActive = false;
    employee.updatedAt = this.dataService.now();
    // ⚠️ BUG-08: pending leaves intentionally NOT cancelled here
    // Fixed version:
    // this.dataService.leaveRequests
    //   .filter(r => r.employeeId === id && r.status === 'pending')
    //   .forEach(r => { r.status = 'cancelled'; r.updatedAt = this.dataService.now(); });
    this.dataService.updateEmployee(employee);
  }
}
