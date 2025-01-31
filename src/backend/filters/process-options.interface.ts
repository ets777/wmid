import { TaskPeriod } from '@backend/task-periods/task-periods.model';
import { Task } from '@backend/tasks/tasks.model';

type FilterFunction<T> = (param: T) => boolean;
export type PeriodFilter = (FilterFunction<TaskPeriod> | FilterFunction<TaskPeriod>[]);
export type TaskFilter = (FilterFunction<Task> | FilterFunction<Task>[]);
export interface IProcessOptions {
    periodFilters?: PeriodFilter[],
    taskFilters?: TaskFilter[],
    sort?: boolean,
}