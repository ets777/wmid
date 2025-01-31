import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Role } from '@backend/roles/roles.model';
import { User } from '@backend/users/users.model';

@Table({ tableName: 'user_roles', createdAt: false, updatedAt: false })
export class UserRole extends Model<UserRole> {
  @ForeignKey(() => Role)
  @Column({ type: DataType.INTEGER })
  declare roleId: number;
  
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  declare userId: number;
}

export interface IUserRole {
  roleId: number;
  userId: number;
}
