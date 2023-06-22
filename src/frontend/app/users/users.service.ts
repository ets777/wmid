import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config } from 'classes/Config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<boolean> {
    return this.http.get<any>(`${Config.getApiPath()}/users`);
  }
}
