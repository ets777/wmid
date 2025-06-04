import { Injectable } from '@angular/core';
import { Config } from 'app/core/classes/Config';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { AuthResponseDto } from '@backend/auth/dto/auth-response.dto';
import { CreateUserDto } from '@backend/users/dto/create-user.dto';
import { UserCredentialsDto } from '@backend/users/dto/user-credentials.dto';
import { IUser } from 'app/features/auth/interfaces/User.interface';
import { CookieOptions, CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private user: IUser;
    private defaultCookieOptions: CookieOptions = { 
        path: '/', 
        secure: true, 
        sameSite: 'Lax',
        domain: undefined,
        expires: new Date(new Date().setDate(new Date().getDate() + 14)),
    };
    private httpOptions = { withCredentials: true };

    constructor(
        private http: HttpClient, 
        private cookieService: CookieService,
        private router: Router,
    ) { }

    public signIn(userCredentialsDto: UserCredentialsDto): Observable<IUser> {
        return this.http
            .post<AuthResponseDto>(
                `${Config.getApiPath()}/auth/sign-in`, 
                userCredentialsDto, 
                this.httpOptions,
            )
            .pipe(
                map((authResponse: AuthResponseDto) => {
                    this.saveSession(authResponse);
                    this.user = this.mapUserFromResponse(authResponse);
                    return this.user;
                }),
            );
    }

    public signUp(createUserDto: CreateUserDto): Observable<IUser> {
        return this.http
            .post<AuthResponseDto>(
                `${Config.getApiPath()}/auth/sign-up`, 
                createUserDto, 
                this.httpOptions,
            )
            .pipe(
                map((authResponse: AuthResponseDto) => {
                    this.saveSession(authResponse);
                    this.user = this.mapUserFromResponse(authResponse);
                    return this.user;
                }),
            );
    }

    public signOut(): Observable<boolean> {
        return this.http.get<boolean>(
            `${Config.getApiPath()}/auth/sign-out`, 
            this.httpOptions,
        ).pipe(
            tap(() => {
                const { path, secure, domain, sameSite } = this.defaultCookieOptions;
                this.cookieService.delete(
                    'session-id',
                    path,
                    domain,
                    secure,
                    sameSite,
                );
                this.user = null;
                this.router.navigate(['/auth/sign-in']);
            }),
        );
    }

    public getUser(): IUser {
        return this.user;
    }

    public setUser(user: IUser): void {
        this.user = user;
    }

    public checkAuth(): Observable<boolean> {
        return this.http.get<AuthResponseDto>(
            `${Config.getApiPath()}/auth/check`, 
            this.httpOptions,
        ).pipe(
            map((authResponse: AuthResponseDto) => {
                if (authResponse) {
                    this.user = this.mapUserFromResponse(authResponse);
                    return true;
                }
                return false;
            }),
        );
    }

    private saveSession(authResponse: AuthResponseDto): void {        
        this.cookieService.set(
            'session-id', 
            authResponse.sessionId,
            this.defaultCookieOptions,
        );
    }

    private mapUserFromResponse(authResponse: AuthResponseDto): IUser {
        return {
            username: authResponse.user.username,
            roles: authResponse.user.roles?.map(role => ({
                code: role.code,
                name: role.name,
            })) || [],
            totalEarnedPoints: authResponse.user.totalEarnedPoints,
        };
    }

    public getSessionId(): string {
        return this.cookieService.get('session-id');
    }

    public checkUsernameAvailability(username: string): Observable<boolean> {
        return this.http.get<boolean>(
            `${Config.getApiPath()}/users/check-username/${username}`, 
            this.httpOptions,
        );
    }

    public checkEmailAvailability(email: string): Observable<boolean> {
        return this.http.get<boolean>(
            `${Config.getApiPath()}/users/check-email/${email}`, 
            this.httpOptions,
        );
    }
}
