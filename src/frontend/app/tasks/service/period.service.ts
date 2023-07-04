import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IPeriodType } from '../interface/period-type.interface';
import { TaskPeriodType } from '@backend/task-periods/task-periods.enum';

@Injectable({
  providedIn: 'root',
})
export class PeriodService {
  constructor(private http: HttpClient) {}

  getPeriodTypes(): IPeriodType[] {
    console.log(Object.entries(TaskPeriodType));

    return [];
  }
}
