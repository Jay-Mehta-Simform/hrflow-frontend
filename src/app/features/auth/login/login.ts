import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly showPassword = signal(false);
  readonly loading = signal(false);
  // ⚠️ BUG-05: error is not cleared when user starts typing
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    // ⚠️ BUG-05: errorMessage.set(null) intentionally omitted here

    const { email, password } = this.form.getRawValue();
    const result = this.auth.login(email!, password!);

    if (result.success) {
      this.router.navigate(['/reports']);
    } else {
      this.errorMessage.set(result.error ?? 'Login failed');
    }
    this.loading.set(false);
  }
}
