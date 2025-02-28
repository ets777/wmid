import { Month, TaskPeriodType, Weekday } from './task-periods.enum';

export interface ITaskPeriod {
    id: number;
    typeId: TaskPeriodType;
    taskId: number;
    startTime: string;
    endTime: string;
    weekday: Weekday;
    day: number;
    month: Month;
    date: string;
}
