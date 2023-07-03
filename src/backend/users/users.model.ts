import {
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Role } from '../roles/roles.model';
import { UserRole } from '../roles/user-roles.model';
import { ApiProperty } from '@nestjs/swagger';
import { Task } from 'tasks/tasks.model';

interface UserCreationAttrs {
  email: string;
  password: string;
}

@Table({ tableName: 'users' })
export class User extends Model<User, UserCreationAttrs> {
  @ApiProperty({
    example: 'user',
    description: 'Имя',
  })
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  username: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Электронная почта',
  })
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  email: string;

  @ApiProperty({ example: 'Password999!', description: 'Пароль' })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  refreshToken: string;

  @BelongsToMany(() => Role, () => UserRole)
  roles: Role[];

  @HasMany(() => Task)
  tasks: Task[];
}
