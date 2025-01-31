import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/features/auth/services/auth.service';
import { Observable, catchError, firstValueFrom, from, lastValueFrom, map, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TokenInterceptorService implements HttpInterceptor {
    constructor(
        private authService: AuthService,
        private router: Router,
    ) { }

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler,
    ): Observable<HttpEvent<any>> {
        return from(this.handle(request, next));
    }

    async handle(request: HttpRequest<any>, next: HttpHandler) {
        let accessToken = this.authService.getAccessToken();
        const refreshToken = this.authService.getRefreshToken();

        if (request.url.split('/').at(-1) === 'refresh') {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${refreshToken}`,
                },
            });
        } else {
            const accessTokenBody = this.authService.getAccessTokenBody();
            const refreshTokenBody = this.authService.getRefreshTokenBody();

            if (accessTokenBody) {
                if (accessTokenBody.exp > Date.now() / 1000) {
                    this.authService.checkAuth().pipe(
                        catchError((err) => {
                            this.redirect();
                            return throwError(() => new Error(err));
                        }),
                    );
                } else {
                    if (refreshTokenBody) {
                        if (refreshTokenBody.exp > Date.now() / 1000) {
                            accessToken = await firstValueFrom(this.authService.refreshToken().pipe(
                                catchError((err) => {
                                    this.redirect();
                                    return throwError(() => new Error(err));
                                }),
                            ));
                        } else {
                            this.redirect();
                        }
                    } else {
                        this.redirect();
                    }
                }
            } else {
                this.redirect();
            }

            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${accessToken}`,
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

    redirect(): void {
        this.router.navigate(['/auth/sign-in']);
    }
}
