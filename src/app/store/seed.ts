import { Injectable } from '@angular/core';
import { InMemoryData } from './in-memory-data';

@Injectable({
  providedIn: 'root',
})
export class Seed {
  constructor(private readonly store: InMemoryData) {}

  seed(): void {
    if (this.store.users.length > 0) return; // already seeded

    const now = new Date();

    // ─── Departments ───────────────────────────────────────────────
    const deptEng = {
      id: 'dept-1',
      name: 'Engineering',
      description: 'Software engineering team',
      isActive: true,
      createdAt: now,
    };
    const deptHR = {
      id: 'dept-2',
      name: 'Human Resources',
      description: 'HR department',
      isActive: true,
      createdAt: now,
    };
    const deptFinance = {
      id: 'dept-3',
      name: 'Finance',
      description: 'Finance team',
      isActive: true,
      createdAt: now,
    };
    const deptInactive = {
      id: 'dept-4',
      name: 'Legacy Operations',
      description: 'Decommissioned department',
      isActive: false,
      createdAt: now,
    };
    [deptEng, deptHR, deptFinance, deptInactive].forEach((d) => this.store.addDepartment(d));

    // ─── Users ─────────────────────────────────────────────────────
    const userAdmin = {
      id: 'user-1',
      email: 'admin@hrflow.com',
      passwordHash: 'Admin@1234',
      role: 'hr_admin' as const,
      isActive: true,
      createdAt: now,
    };
    const userManager = {
      id: 'user-2',
      email: 'manager@hrflow.com',
      passwordHash: 'Manager@1234',
      role: 'manager' as const,
      isActive: true,
      createdAt: now,
    };
    const userEmployee = {
      id: 'user-3',
      email: 'employee@hrflow.com',
      passwordHash: 'Employee@1234',
      role: 'employee' as const,
      isActive: true,
      createdAt: now,
    };
    [userAdmin, userManager, userEmployee].forEach((u) => this.store.addUser(u));

    // ─── Employees ─────────────────────────────────────────────────
    const empAdmin: import('../shared/interfaces/employee.interface').Employee = {
      id: 'emp-1',
      userId: 'user-1',
      firstName: 'Alice',
      lastName: 'Smith',
      designation: 'HR Manager',
      departmentId: 'dept-2',
      managerId: null,
      joiningDate: '2023-01-01',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    const empManager: import('../shared/interfaces/employee.interface').Employee = {
      id: 'emp-2',
      userId: 'user-2',
      firstName: 'Bob',
      lastName: 'Johnson',
      designation: 'Engineering Manager',
      departmentId: 'dept-1',
      managerId: 'emp-1',
      joiningDate: '2023-03-15',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    const empEmployee: import('../shared/interfaces/employee.interface').Employee = {
      id: 'emp-3',
      userId: 'user-3',
      firstName: 'Carol',
      lastName: 'Williams',
      designation: 'Software Engineer',
      departmentId: 'dept-1',
      managerId: 'emp-2',
      joiningDate: '2024-06-01',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    [empAdmin, empManager, empEmployee].forEach((e) => this.store.addEmployee(e));

    // ─── Leave Types ───────────────────────────────────────────────
    const ltAnnual = {
      id: 'lt-1',
      name: 'Annual' as const,
      description: 'Annual paid leave',
      isPaid: true,
      isActive: true,
    };
    const ltSick = {
      id: 'lt-2',
      name: 'Sick' as const,
      description: 'Sick leave',
      isPaid: true,
      isActive: true,
    };
    const ltCasual = {
      id: 'lt-3',
      name: 'Casual' as const,
      description: 'Casual leave',
      isPaid: true,
      isActive: true,
    };
    const ltUnpaid = {
      id: 'lt-4',
      name: 'Unpaid' as const,
      description: 'Unpaid leave',
      isPaid: false,
      isActive: true,
    };
    [ltAnnual, ltSick, ltCasual, ltUnpaid].forEach((lt) => this.store.addLeaveType(lt));

    // ─── Leave Policies ────────────────────────────────────────────
    this.store.addLeavePolicy({
      id: 'lp-1',
      leaveTypeId: 'lt-1',
      allowedDaysPerYear: 20,
      carryForwardAllowed: true,
      maxCarryForwardDays: 5,
      createdAt: now,
      updatedAt: now,
    });
    this.store.addLeavePolicy({
      id: 'lp-2',
      leaveTypeId: 'lt-2',
      allowedDaysPerYear: 10,
      carryForwardAllowed: false,
      maxCarryForwardDays: 0,
      createdAt: now,
      updatedAt: now,
    });
    this.store.addLeavePolicy({
      id: 'lp-3',
      leaveTypeId: 'lt-3',
      allowedDaysPerYear: 5,
      carryForwardAllowed: false,
      maxCarryForwardDays: 0,
      createdAt: now,
      updatedAt: now,
    });
    this.store.addLeavePolicy({
      id: 'lp-4',
      leaveTypeId: 'lt-4',
      allowedDaysPerYear: 30,
      carryForwardAllowed: false,
      maxCarryForwardDays: 0,
      createdAt: now,
      updatedAt: now,
    });

    // ─── Leave Balances (current year) ─────────────────────────────
    const year = new Date().getFullYear();
    const employeeIds = ['emp-1', 'emp-2', 'emp-3'];
    const leaveTypeIds = [
      { id: 'lt-1', days: 20 },
      { id: 'lt-2', days: 10 },
      { id: 'lt-3', days: 5 },
      { id: 'lt-4', days: 30 },
    ];
    let balanceSeq = 1;
    for (const empId of employeeIds) {
      for (const lt of leaveTypeIds) {
        this.store.addLeaveBalance({
          id: `lb-${balanceSeq++}`,
          employeeId: empId,
          leaveTypeId: lt.id,
          year,
          totalAllocated: lt.days,
          used: 0,
          carryForward: 0,
          createdAt: now,
        });
      }
    }

    // ─── Public Holidays (current year) ────────────────────────────
    this.store.addPublicHoliday({
      id: 'ph-1',
      name: "New Year's Day",
      date: `${year}-01-01`,
      year,
      description: 'New Year celebration',
    });
    this.store.addPublicHoliday({
      id: 'ph-2',
      name: 'Independence Day',
      date: `${year}-08-15`,
      year,
      description: 'National holiday',
    });
    this.store.addPublicHoliday({
      id: 'ph-3',
      name: 'Christmas Day',
      date: `${year}-12-25`,
      year,
      description: 'Christmas celebration',
    });

    console.log('HRFlow seed data loaded.');
    console.log('HR Admin   → admin@hrflow.com / Admin@1234');
    console.log('Manager    → manager@hrflow.com / Manager@1234');
    console.log('Employee   → employee@hrflow.com / Employee@1234');
  }
}
