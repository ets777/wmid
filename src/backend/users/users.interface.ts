import { Task } from '@backend/tasks/tasks.model';
import { IRole } from '../roles/roles.interface';

export interface IUser {
    id?: number;
    username?: string;
    email?: string;
    password?: string;
    refreshToken?: string;
    roles?: IRole[];
    tasks?: Task[];
}
