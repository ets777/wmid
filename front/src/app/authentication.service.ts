import { Injectable } from '@angular/core';
import { Config } from '../classes/Config';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  user: { authKey: string } = { authKey: '' };

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http
      .post<any>(`${Config.getRoot()}/back/auth.php`, { username, password })
      .subscribe(a => {
        if (a && a?.success) {
          this.user = { authKey: a?.data };
        }
      });
  }

  checkAuth() {
    return this.http.get<any>(`${Config.getRoot()}/back/check_auth.php`);
  }
}
