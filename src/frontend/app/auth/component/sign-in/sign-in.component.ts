import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { IUser } from '../../interface/User.interface';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.sass'],
})
export class SignInComponent {
  signInForm: FormGroup;
  errorMessage: string;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.signInForm = this.formBuilder.group({
      username: '',
      password: '',
    });
  }

  onSubmit(): void {
    const username = this.signInForm.value.username;
    const password = this.signInForm.value.password;

    this.authService
      .signIn(username, password)
      .pipe(catchError(this.handleError))
      .subscribe({
        next: (user: IUser) => {
          this.authService.setUser(user);
          this.router.navigate(['/']);
        },
        error: (error: any) => {
          this.errorMessage = error.toString().replace('Error: ', '');
        },
      });
  }

  public handleError(error: HttpErrorResponse): Observable<never> {
    let message = '';

    if (error.status == 401) {
      message = 'Неверный логин или пароль';
    } else {
      message = 'Произошла ошибка, попробуйте позже';
    }

    return throwError(() => new Error(message));
  }
}
