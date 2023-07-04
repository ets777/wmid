import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IGrowthType } from '../interface/growth-type.interface';
import { IGrowthHistory } from '../interface/growth-history.interface';
import { IGrowthProgress } from '../interface/growth-progress.interface';
import { Config } from '../../../classes/Config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GrowthService {
  constructor(private http: HttpClient) {}

  getGrowthTypes(): Observable<IGrowthType[]> {
    return this.http.get<IGrowthType[]>(
      `${Config.getRoot()}/back/get_growth_types.php`,
    );
  }

  getLastGrowth(): Observable<IGrowthHistory[]> {
    return this.http.get<IGrowthHistory[]>(
      `${Config.getRoot()}/back/get_last_growth.php`,
    );
  }

  getGrowthProgress(): Observable<IGrowthProgress> {
    return this.http.get<IGrowthProgress>(
      `${Config.getRoot()}/back/get_growth_progress.php`,
    );
  }
}
