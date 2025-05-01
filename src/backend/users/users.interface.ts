import { Task } from '@backend/tasks/tasks.model';
import { IRole } from '@backend/roles/roles.interface';

export interface IUser {
    id?: number;
    username?: string;
    email?: string;
    password?: string;
    refreshToken?: string;
    roles?: IRole[];
    tasks?: Task[];
    totalEarnedPoints?: number;
    totalSpentPoints?: number;
}
