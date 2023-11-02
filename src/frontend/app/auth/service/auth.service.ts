import { Injectable } from '@angular/core';
import { Config } from '../../../classes/Config';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthResponseDto } from '@backend/auth/dto/auth-response.dto';
import { IUser } from '../interface/User.interface';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user: IUser;

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  signIn(username: string, password: string): Observable<IUser> {
    return this.http
      .post<any>(`${Config.getApiPath()}/auth/sign-in`, {
        username,
        password,
      })
      .pipe(
        map((authResponse: AuthResponseDto) => {
          this.saveTokens(authResponse);
          return this.getUserFromToken(authResponse.accessToken);
        }),
      );
  }

  signOut(): Observable<boolean> {
    this.cookieService.delete('access-token');
    this.cookieService.delete('refresh-token');
    this.user = null;

    return this.http.get<any>(`${Config.getApiPath()}/auth/sign-out`);
  }

  getUser(): IUser {
    return this.user;
  }

  setUser(user: IUser): void {
    this.user = user;
  }

  checkAuth(): Observable<boolean> {
    return this.http.get<any>(`${Config.getApiPath()}/auth/check`).pipe(
      map((result: boolean) => {
        if (result) {
          this.user = this.getUserFromToken(this.getAccessToken());
        }

        return result;
      }),
    );
  }

  refreshToken(): Observable<any> {
    return this.http.get<any>(`${Config.getApiPath()}/auth/refresh`).pipe(
      map((authResponse: AuthResponseDto) => {
        this.saveTokens(authResponse);
        return authResponse.accessToken;
      }),
    );
  }

  private saveTokens(authResponse: AuthResponseDto): void {
    this.cookieService.set('access-token', authResponse.accessToken);
    this.cookieService.set('refresh-token', authResponse.refreshToken);
  }

  private getUserFromToken(token: string): IUser {
    const tokenBody = this.parseJwt(token);

    return {
      username: tokenBody.username,
      roles: tokenBody.roles.map((role: any) => ({
        code: role.code,
        name: role.name,
      })),
    };
  }

  getAccessToken(): string {
    return this.cookieService.get('access-token');
  }

  getRefreshToken(): string {
    return this.cookieService.get('refresh-token');
  }

  getAccessTokenBody(): any {
    const tokenFromCookie = this.getAccessToken();

    return tokenFromCookie ? this.parseJwt(tokenFromCookie) : '';
  }

  getRefreshTokenBody(): any {
    const tokenFromCookie = this.getRefreshToken();

    return tokenFromCookie ? this.parseJwt(tokenFromCookie) : '';
  }

  private parseJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    return JSON.parse(jsonPayload);
  }
}
