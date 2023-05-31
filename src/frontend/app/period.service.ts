import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Period } from '../classes/Period';
import { Config } from '../classes/Config';

@Injectable({
  providedIn: 'root'
})
export class PeriodService {

  constructor(
    private http: HttpClient
  ) { }

  getPeriods() {
    return this.http.get<Period[]>(`${Config.getRoot()}/back/get_period_types.php`);
  }
}
