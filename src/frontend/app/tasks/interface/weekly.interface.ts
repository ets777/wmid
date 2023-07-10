import { Weekday } from '@backend/task-periods/task-periods.enum';

export class IWeekly {
  weekday?: Weekday;
  startTime?: string;
  endTime?: string;
}
