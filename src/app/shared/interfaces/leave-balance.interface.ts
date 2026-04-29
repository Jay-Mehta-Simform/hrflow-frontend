export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  year: number;
  totalAllocated: number;
  used: number;
  carryForward: number;
  createdAt: Date;
}
