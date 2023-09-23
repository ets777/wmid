import { ITaskPeriod } from '../task-periods/task-periods.interface';

export interface ITask {
  text?: string;
  nextTaskBreak?: number;
  endDate?: string;
  offset?: number;
  duration?: number;
  isActive?: boolean;
  isDeleted?: boolean;
  cooldown?: number;
  isImportant?: boolean;
  nextTaskId?: number;
  categoryId?: number;
  userId?: number;
  periods?: ITaskPeriod[];
  additionalTasks?: ITask[];
}
