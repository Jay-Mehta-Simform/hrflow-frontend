export interface LeaveType {
  id: string;
  name: 'Annual' | 'Sick' | 'Casual' | 'Unpaid';
  description: string;
  isPaid: boolean;
  isActive: boolean;
}
