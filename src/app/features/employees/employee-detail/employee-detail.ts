import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-employee-detail',
  imports: [],
  templateUrl: './employee-detail.html',
  styleUrl: './employee-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeDetail {

}
