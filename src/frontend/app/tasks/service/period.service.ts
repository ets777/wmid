import { Injectable } from '@angular/core';
import { IPeriodType } from '../interface/period-type.interface';
import { taskPeriodTypes } from '@backend/task-periods/task-periods.enum';

@Injectable({
  providedIn: 'root',
})
export class PeriodService {
  getPeriodTypes(): IPeriodType[] {
    return taskPeriodTypes.map(
      (item) =>
        ({
          id: item.id,
          name: item.name,
        } as IPeriodType),
    );
  }
}
