import { Component, DestroyRef, effect, inject, signal, computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AuthSessionService } from '../../services/auth-session.service';
import { RegistrationKind } from '../../models/auth/register-request.model';
import { IconComponent } from '../icon/icon.component';
import { AuthIntroComponent } from './auth-intro/auth-intro.component';
import { AuthHeaderComponent } from './auth-header/auth-header.component';

function matchingPasswords(control: AbstractControl): ValidationErrors | null {
  return control.get('password')?.value === control.get('confirmation')?.value
    ? null
    : { passwordMismatch: true };
}

@Component({
  selector: 'app-auth',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    IconComponent,
    AuthIntroComponent,
    AuthHeaderComponent,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  private readonly auth = inject(AuthService);
  protected readonly session = inject(AuthSessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routeData = toSignal(this.route.data, {
    initialValue: this.route.snapshot.data,
  });
  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  protected readonly registration = computed(() => this.routeData()['registration'] === true);
  protected readonly pending = signal(false);
  protected readonly serverError = signal('');
  protected readonly showPassword = signal(false);
  protected readonly kind = signal<RegistrationKind>('client');
  protected readonly form = inject(NonNullableFormBuilder).group({
    username: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmation: [''],
  });

  constructor() {
    effect(() => {
      const registration = this.registration();
      this.kind.set(this.params().get('role') === 'seller' ? 'seller' : 'client');
      this.form.reset();
      this.form.controls.username.setValidators(
        registration
          ? [Validators.required, Validators.minLength(3), Validators.maxLength(255)]
          : [],
      );
      this.form.controls.confirmation.setValidators(registration ? [Validators.required] : []);
      this.form.setValidators(registration ? matchingPasswords : []);
      this.form.controls.username.updateValueAndValidity({ emitEvent: false });
      this.form.controls.confirmation.updateValueAndValidity({ emitEvent: false });
      this.form.updateValueAndValidity({ emitEvent: false });
      this.serverError.set('');
      this.showPassword.set(false);
    });
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.serverError.set(''));
  }

  protected fieldError(field: 'username' | 'email' | 'password' | 'confirmation'): string {
    const control = this.form.controls[field];
    if (!control.touched) return '';
    if (control.hasError('required')) return 'Заполни это поле.';
    if (control.hasError('email')) return 'Введи email в формате name@example.com.';
    if (control.hasError('minlength'))
      return field === 'username'
        ? 'Имя должно содержать не менее 3 символов.'
        : 'Пароль должен содержать не менее 8 символов.';
    if (control.hasError('maxlength')) return 'Имя должно быть не длиннее 255 символов.';
    if (field === 'confirmation' && this.form.hasError('passwordMismatch'))
      return 'Пароли не совпадают.';
    return '';
  }

  protected submit(): void {
    if (this.pending()) return;
    this.form.controls.email.setValue(this.form.controls.email.value.trim());
    this.form.controls.username.setValue(this.form.controls.username.value.trim());
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.pending.set(true);
    this.serverError.set('');
    const { username, email, password } = this.form.getRawValue();
    const request = this.registration()
      ? this.auth.register({ username, email, password }, this.kind())
      : this.auth.login({ email, password });
    request
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.pending.set(false)),
      )
      .subscribe({
        next: () => {
          this.form.reset();
          void this.router.navigateByUrl('/');
        },
        error: (error: unknown) => this.serverError.set(this.errorMessage(error)),
      });
  }

  private errorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse))
      return 'Не удалось завершить запрос. Попробуй ещё раз.';
    switch (error.status) {
      case 0:
        return 'Не удалось связаться с сервером. Проверь подключение и попробуй ещё раз.';
      case 400:
        return 'Проверь введённые данные и попробуй ещё раз.';
      case 401:
        return this.registration()
          ? 'Не удалось завершить регистрацию. Попробуй ещё раз.'
          : 'Не удалось войти. Проверь email и пароль.';
      case 403:
        return 'Доступ запрещён. У аккаунта нет прав для этого действия.';
      case 409:
        return 'Этот email или имя уже заняты. Попробуй другие данные или войди в аккаунт.';
      case 429:
        return 'Слишком много попыток. Подожди немного и попробуй снова.';
      default:
        return 'Сервис временно недоступен. Попробуй чуть позже.';
    }
  }
}
