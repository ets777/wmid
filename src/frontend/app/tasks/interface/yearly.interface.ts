import { Month } from '@backend/task-periods/task-periods.enum';

export class IYearly {
  month?: Month;
  day?: number;
  startTime?: string;
  endTime?: string;
}
