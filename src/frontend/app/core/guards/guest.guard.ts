import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/features/auth/services/auth.service';
import { Observable, catchError, map, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GuestGuard {
    constructor(private router: Router, private authService: AuthService) { }

    public canActivate(): Observable<boolean> | boolean {
        const sessionId = this.authService.getSessionId();

        if (sessionId) {
            return this.getCheckAuthObservable();
        } else {
            return true;
        }
    }

    private getCheckAuthObservable(): Observable<boolean> {
        return this.authService.checkAuth().pipe(
            catchError((err) => {
                return throwError(() => new Error(err));
            }),
            map((result: boolean) => {
                return result === true ? this.redirect() : true;
            }),
        );
    }

    private redirect(): boolean {
        this.router.navigate(['/']);
        return false;
    }
}
