import { Role } from './Role.interface';

export interface User {
  username: string;
  roles: Role[];
}
