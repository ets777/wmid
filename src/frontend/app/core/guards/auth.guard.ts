import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/features/auth/services/auth.service';
import { Observable, catchError, map, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard {
    constructor(private router: Router, private authService: AuthService) { }

    public canActivate(): Observable<boolean> | boolean {
        const accessToken = this.authService.getAccessTokenBody();
        const refreshToken = this.authService.getRefreshTokenBody();

        if (accessToken) {
            if (accessToken.exp > Date.now() / 1000) {
                return this.getCheckAuthObservable();
            } else {
                if (refreshToken) {
                    if (refreshToken.exp > Date.now() / 1000) {
                        return this.getRefreshTokenObservable();
                    } else {
                        return this.redirect();
                    }
                } else {
                    return this.redirect();
                }
            }
        } else {
            return this.redirect();
        }
    }

    private getCheckAuthObservable(): Observable<boolean> {
        return this.authService.checkAuth().pipe(
            catchError((err) => {
                this.router.navigate(['/auth/sign-in']);
                return throwError(() => new Error(err));
            }),
            map((result: boolean) => {
                return result === true;
            }),
        );
    }

    private getRefreshTokenObservable(): Observable<boolean> {
        return this.authService.refreshToken().pipe(
            catchError((err) => {
                this.router.navigate(['/auth/sign-in']);
                return throwError(() => new Error(err));
            }),
            map((result: any) => {
                return !!result;
            }),
        );
    }

    private redirect(): boolean {
        this.router.navigate(['/auth/sign-in']);
        return false;
    }
}
