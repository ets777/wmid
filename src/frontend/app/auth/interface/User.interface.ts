import { IRole } from './Role.interface';

export interface IUser {
  username: string;
  roles: IRole[];
}
