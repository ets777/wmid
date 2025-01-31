import {
    BelongsToMany,
    Column,
    DataType,
    HasMany,
    Model,
    Table,
} from 'sequelize-typescript';
import { Role } from '@backend/roles/roles.model';
import { UserRole } from '../roles/user-roles.model';
import { ApiProperty } from '@nestjs/swagger';
import { Task } from '@backend/tasks/tasks.model';

@Table({ tableName: 'users' })
export class User extends Model<User> {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Электронная почта',
    })
    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: false,
    })
    declare email: string;

    @ApiProperty({
        example: 'user',
        description: 'Имя',
    })
    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: false,
    })
    declare username: string;

    @ApiProperty({ example: 'Password999!', description: 'Пароль' })
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare password: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare refreshToken: string;

    @BelongsToMany(() => Role, () => UserRole)
    declare roles: Role[];

    @HasMany(() => Task)
    declare tasks: Task[];
}