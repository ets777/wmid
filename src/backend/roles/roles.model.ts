import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/users.model';
import { UserRole } from './user-roles.model';
import { ApiProperty } from '@nestjs/swagger';
import { CreateRoleDto } from './dto/create-role.dto';

@Table({ tableName: 'roles', createdAt: false, updatedAt: false })
export class Role extends Model<Role, CreateRoleDto> {
  @ApiProperty({ example: 'admin', description: 'Код роли' })
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  code: string;

  @ApiProperty({ example: 'Админ', description: 'Название роли' })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @BelongsToMany(() => User, () => UserRole)
  users: User[];
}
