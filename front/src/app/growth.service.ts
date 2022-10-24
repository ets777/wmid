import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GrowthType } from '../classes/GrowthType';
import { GrowthHistory } from '../classes/GrowthHistory';
import { GrowthProgress } from '../classes/GrowthProgress';
import { Config } from '../classes/Config';

@Injectable({
  providedIn: 'root'
})
export class GrowthService {

  constructor(
    private http: HttpClient
  ) { }

  getGrowthTypes() {
    return this.http.get<GrowthType[]>(`${Config.getRoot()}/back/get_growth_types.php`);
  }

  getLastGrowth() {
    return this.http.get<GrowthHistory[]>(`${Config.getRoot()}/back/get_last_growth.php`);
  }

  getGrowthProgress() {
    return this.http.get<GrowthProgress>(`${Config.getRoot()}/back/get_growth_progress.php`);
  }
}
