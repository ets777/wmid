import { IRole } from './Role.interface.js';

export interface IUser {
    username: string;
    roles: IRole[];
}
