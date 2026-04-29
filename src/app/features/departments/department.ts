import { Injectable, inject } from '@angular/core';
import { Department as IDepartment } from '../../shared/interfaces/department.interface';
import { InMemoryData } from '../../store/in-memory-data';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private readonly dataService = inject(InMemoryData);

  getAll(): IDepartment[] {
    return this.dataService.departments;
  }

  create(name: string, description: string): IDepartment {
    const dept: IDepartment = {
      id: this.dataService.generateId(),
      name,
      description,
      isActive: true,
      createdAt: this.dataService.now(),
    };
    this.dataService.addDepartment(dept);
    return dept;
  }

  deactivate(id: string): void {
    const dept = this.dataService.departments.find((d) => d.id === id);
    if (dept) {
      dept.isActive = false;
    }
  }

  remove(id: string): void {
    // ⚠️ BUG-07: no check for active employees before deletion
    // Fixed version would check: this.dataService.employees.filter(e => e.departmentId === id && e.isActive)
    this.dataService.removeDepartment(id);
  }
}
