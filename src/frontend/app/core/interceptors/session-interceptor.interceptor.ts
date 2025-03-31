import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from 'app/features/auth/services/auth.service';
import { Observable, catchError, from, lastValueFrom, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SessionInterceptorService implements HttpInterceptor {
    constructor(
        private authService: AuthService,
    ) { }

    public intercept(
        request: HttpRequest<unknown>,
        next: HttpHandler,
    ): Observable<HttpEvent<unknown>> {
        return from(this.handle(request, next));
    }

    private async handle(request: HttpRequest<unknown>, next: HttpHandler): Promise<HttpEvent<unknown>> {
        const sessionId = this.authService.getSessionId();

        if (sessionId) {
            request = request.clone({
                setHeaders: {
                    'X-Session-ID': sessionId,
                },
            });
        }

        return await lastValueFrom(next.handle(request).pipe(
            catchError((err) => {
                if (err.status === 401) {
                    this.authService.signOut();
                }
                const error = err.error.message || err.statusText;
                return throwError(() => new Error(error));
            }),
        ));
    }
}
