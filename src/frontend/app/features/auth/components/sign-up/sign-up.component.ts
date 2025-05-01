import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { AuthService } from 'app/features/auth/services/auth.service';
import { catchError, Observable, throwError, map, debounceTime, distinctUntilChanged, first } from 'rxjs';
import { IUser } from 'app/features/auth/interfaces/User.interface';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { getErrorMessage } from 'app/helpers/validation.helper';
import { getClientTimezone } from 'app/helpers/common.helper';

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.scss'],
    standalone: false,
})
export class SignUpComponent {
    protected signUpForm: FormGroup;
    protected errorMessage: string;
    protected getErrorMessage = getErrorMessage;
    protected isCheckingUsername = false;
    protected isCheckingEmail = false;
    protected isPasswordVisible = false;

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router,
    ) {
        this.signUpForm = this.formBuilder.group({
            username: ['', 
                [Validators.required],
                [this.usernameAvailabilityValidator()],
            ],
            password: ['', [Validators.required, Validators.minLength(6)]],
            email: ['', 
                [Validators.required, Validators.email],
                [this.emailAvailabilityValidator()],
            ],
        });
    }

    protected togglePasswordVisibility(): void {
        this.isPasswordVisible = !this.isPasswordVisible;
    }

    private usernameAvailabilityValidator(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors | null> => {
            if (!control.value) {
                return new Observable(observer => {
                    observer.next(null);
                    observer.complete();
                });
            }

            this.isCheckingUsername = true;
            
            return this.authService.checkUsernameAvailability(control.value).pipe(
                debounceTime(300),
                distinctUntilChanged(),
                map(available => {
                    this.isCheckingUsername = false;
                    return available ? null : { usernameTaken: true };
                }),
                first(),
                catchError(() => {
                    this.isCheckingUsername = false;
                    return new Observable(observer => {
                        observer.next(null);
                        observer.complete();
                    });
                }),
            );
        };
    }

    private emailAvailabilityValidator(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors | null> => {
            if (!control.value) {
                return new Observable(observer => {
                    observer.next(null);
                    observer.complete();
                });
            }

            this.isCheckingEmail = true;
            
            return this.authService.checkEmailAvailability(control.value).pipe(
                debounceTime(300),
                distinctUntilChanged(),
                map(available => {
                    this.isCheckingEmail = false;
                    return available ? null : { emailTaken: true };
                }),
                first(),
                catchError(() => {
                    this.isCheckingEmail = false;
                    return new Observable(observer => {
                        observer.next(null);
                        observer.complete();
                    });
                }),
            );
        };
    }

    protected onSubmit(): void {
        if (this.signUpForm.invalid) {
            return;
        }

        const credentials = {
            username: this.signUpForm.value.username,
            password: this.signUpForm.value.password,
            email: this.signUpForm.value.email,
            timezone: getClientTimezone(),
        };

        this.authService
            .signUp(credentials)
            .pipe(catchError(this.handleError))
            .subscribe({
                next: (user: IUser) => {
                    this.authService.setUser(user);
                    this.router.navigate(['/']);
                },
                error: (error) => {
                    this.errorMessage = error.toString().replace('Error: ', '');
                },
            });
    }

    public handleError(error: HttpErrorResponse): Observable<never> {
        let message = '';

        if (error.status == 401) {
            message = 'Invalid username or password';
        } else {
            message = 'An error occurred, please try again later';
        }

        return throwError(() => new Error(message));
    }
}

