import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Department } from '../shared/interfaces/department.interface';
import { Employee } from '../shared/interfaces/employee.interface';
import { LeaveApproval } from '../shared/interfaces/leave-approval.interface';
import { LeaveBalance } from '../shared/interfaces/leave-balance.interface';
import { LeavePolicy } from '../shared/interfaces/leave-policy.interface';
import { LeaveRequest } from '../shared/interfaces/leave-request.interface';
import { LeaveType } from '../shared/interfaces/leave-type.interface';
import { PublicHoliday } from '../shared/interfaces/public-holiday.interface';
import { User } from '../shared/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class InMemoryData {
  private _users: User[] = [];
  private _employees: Employee[] = [];
  private _departments: Department[] = [];
  private _leaveTypes: LeaveType[] = [];
  private _leavePolicies: LeavePolicy[] = [];
  private _leaveBalances: LeaveBalance[] = [];
  private _leaveRequests: LeaveRequest[] = [];
  private _leaveApprovals: LeaveApproval[] = [];
  private _publicHolidays: PublicHoliday[] = [];

  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  private leaveRequestsSubject = new BehaviorSubject<LeaveRequest[]>([]);
  private leaveBalancesSubject = new BehaviorSubject<LeaveBalance[]>([]);

  employees$: Observable<Employee[]> = this.employeesSubject.asObservable();
  leaveRequests$: Observable<LeaveRequest[]> = this.leaveRequestsSubject.asObservable();
  leaveBalances$: Observable<LeaveBalance[]> = this.leaveBalancesSubject.asObservable();

  generateId(): string {
    return uuidv4();
  }
  now(): Date {
    return new Date();
  }

  // ─── Users ────────────────────────────────────────────
  get users(): User[] {
    return this._users;
  }
  addUser(user: User): void {
    this._users.push(user);
  }

  // ─── Employees ────────────────────────────────────────
  get employees(): Employee[] {
    return this._employees;
  }
  addEmployee(employee: Employee): void {
    this._employees.push(employee);
    this.employeesSubject.next([...this._employees]);
  }
  updateEmployee(updated: Employee): void {
    const idx = this._employees.findIndex((e) => e.id === updated.id);
    if (idx > -1) {
      this._employees[idx] = updated;
      this.employeesSubject.next([...this._employees]);
    }
  }

  // ─── Departments ──────────────────────────────────────
  get departments(): Department[] {
    return this._departments;
  }
  addDepartment(dept: Department): void {
    this._departments.push(dept);
  }
  updateDepartment(updated: Department): void {
    const idx = this._departments.findIndex((d) => d.id === updated.id);
    if (idx > -1) {
      this._departments[idx] = updated;
    }
  }
  removeDepartment(id: string): void {
    this._departments = this._departments.filter((d) => d.id !== id);
  }

  // ─── Leave Types ──────────────────────────────────────
  get leaveTypes(): LeaveType[] {
    return this._leaveTypes;
  }
  addLeaveType(lt: LeaveType): void {
    this._leaveTypes.push(lt);
  }
  updateLeaveType(updated: LeaveType): void {
    const idx = this._leaveTypes.findIndex((lt) => lt.id === updated.id);
    if (idx > -1) {
      this._leaveTypes[idx] = updated;
    }
  }

  // ─── Leave Policies ───────────────────────────────────
  get leavePolicies(): LeavePolicy[] {
    return this._leavePolicies;
  }
  addLeavePolicy(p: LeavePolicy): void {
    this._leavePolicies.push(p);
  }
  updateLeavePolicy(updated: LeavePolicy): void {
    const idx = this._leavePolicies.findIndex((p) => p.id === updated.id);
    if (idx > -1) {
      this._leavePolicies[idx] = updated;
    }
  }

  // ─── Leave Balances ───────────────────────────────────
  get leaveBalances(): LeaveBalance[] {
    return this._leaveBalances;
  }
  addLeaveBalance(b: LeaveBalance): void {
    this._leaveBalances.push(b);
    this.leaveBalancesSubject.next([...this._leaveBalances]);
  }
  updateLeaveBalance(updated: LeaveBalance): void {
    const idx = this._leaveBalances.findIndex((b) => b.id === updated.id);
    if (idx > -1) {
      this._leaveBalances[idx] = updated;
      this.leaveBalancesSubject.next([...this._leaveBalances]);
    }
  }

  // ─── Leave Requests ───────────────────────────────────
  get leaveRequests(): LeaveRequest[] {
    return this._leaveRequests;
  }
  addLeaveRequest(r: LeaveRequest): void {
    this._leaveRequests.push(r);
    this.leaveRequestsSubject.next([...this._leaveRequests]);
  }
  updateLeaveRequest(updated: LeaveRequest): void {
    const idx = this._leaveRequests.findIndex((r) => r.id === updated.id);
    if (idx > -1) {
      this._leaveRequests[idx] = updated;
      this.leaveRequestsSubject.next([...this._leaveRequests]);
    }
  }

  // ─── Leave Approvals ──────────────────────────────────
  get leaveApprovals(): LeaveApproval[] {
    return this._leaveApprovals;
  }
  addLeaveApproval(a: LeaveApproval): void {
    this._leaveApprovals.push(a);
  }

  // ─── Public Holidays ──────────────────────────────────
  get publicHolidays(): PublicHoliday[] {
    return this._publicHolidays;
  }
  addPublicHoliday(h: PublicHoliday): void {
    this._publicHolidays.push(h);
  }
  removePublicHoliday(id: string): void {
    this._publicHolidays = this._publicHolidays.filter((h) => h.id !== id);
  }
}
