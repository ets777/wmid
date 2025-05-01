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
        const sessionId = this.authService.getSessionId();
        
        if (sessionId) {
            return this.getCheckAuthObservable();
        } else {
            return this.redirect();
        }
    }

    private getCheckAuthObservable(): Observable<boolean> {
        return this.authService.checkAuth().pipe(
            catchError((err) => {
                this.redirect();
                return throwError(() => new Error(err));
            }),
            map((result: boolean) => {
                if (result === true) {
                    return result;
                } else {
                    return this.redirect();
                };
            }),
        );
    }

    private redirect(): boolean {
        this.router.navigate(['/auth/sign-in']);
        return false;
    }
}
