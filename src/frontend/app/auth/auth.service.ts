import { Injectable } from '@angular/core';
import { Config } from '../../classes/Config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponseDto } from '../../../backend/auth/dto/auth-response.dto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user: { authKey: string } = { authKey: '' };

  constructor(private http: HttpClient) {}

  signIn(username: string, password: string): Observable<AuthResponseDto> {
    return this.http.post<any>(`${Config.getApiPath()}/auth/sign-in`, {
      username,
      password,
    });
  }

  checkAuth(): Observable<any> {
    return this.http.get<any>(`${Config.getRoot()}/back/check_auth.php`);
  }
}