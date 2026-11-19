import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <div class="card login">
      <h2>Iniciar sesión</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>
          Usuario
          <input formControlName="username" autocomplete="username" />
        </label>
        @if (form.controls.username.touched && form.controls.username.invalid) {
          <span class="error">El usuario es obligatorio.</span>
        }

        <label>
          Contraseña
          <input
            type="password"
            formControlName="password"
            autocomplete="current-password"
          />
        </label>
        @if (form.controls.password.touched && form.controls.password.invalid) {
          <span class="error">La contraseña debe tener al menos 6 caracteres.</span>
        }

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }
        @if (info()) {
          <p class="info">{{ info() }}</p>
        }

        <div class="actions">
          <button type="submit" [disabled]="loading()">Ingresar</button>
          <button
            type="button"
            class="secondary"
            [disabled]="loading()"
            (click)="register()"
          >
            Crear cuenta
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .login {
        max-width: 380px;
        margin: 40px auto;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .actions {
        display: flex;
        gap: 8px;
      }
    `,
  ],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  error = signal('');
  info = signal('');
  loading = signal(false);

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(100)]],
    password: [
      '',
      [Validators.required, Validators.minLength(6), Validators.maxLength(100)],
    ],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { username, password } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set('');
    this.info.set('');

    this.auth.login(username, password).subscribe({
      next: () => this.router.navigate(['/players']),
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err.status === 401
            ? 'Usuario o contraseña incorrectos.'
            : 'No se pudo conectar con el servidor.',
        );
      },
    });
  }

  register() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { username, password } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set('');
    this.info.set('');

    this.auth.register(username, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.info.set('Cuenta creada. Ya podés ingresar.');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err.status === 409
            ? 'Ese usuario ya existe.'
            : 'No se pudo crear la cuenta.',
        );
      },
    });
  }
}