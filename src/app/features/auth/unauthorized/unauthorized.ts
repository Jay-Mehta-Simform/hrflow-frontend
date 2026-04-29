import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthorizedComponent {}
