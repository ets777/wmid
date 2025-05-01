import { TaskPeriod } from '@backend/task-periods/task-periods.model';
import { TaskRelation } from '@backend/task-relations/task-relations.model';

export interface ITask {
    id?: number;
    text: string;
    nextTaskBreak: number;
    startDate: string;
    endDate: string;
    duration: number;
    isActive: boolean;
    isDeleted: boolean;
    nextTaskId: number;
    categoryId: number;
    userId: number;
    previousTask: ITask;
    periods: TaskPeriod[];
    relatedTasks: TaskRelation[];
    additionalTasks: ITask[];
    cost?: number;
    cooldown?: number;
    isReward: boolean;
    willBeAppointedIfOverdue: boolean;
}