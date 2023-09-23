import { IRole } from '../roles/roles.interface';
import { ITask } from '../tasks/tasks.interface';

export interface IUser {
  id?: number;
  username?: string;
  email?: string;
  password?: string;
  refreshToken?: string;
  roles?: IRole[];
  tasks?: ITask[];
}
