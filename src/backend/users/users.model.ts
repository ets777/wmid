import {
    BelongsToMany,
    Column,
    DataType,
    HasMany,
    Model,
    Table,
} from 'sequelize-typescript';
import { Role } from '@backend/roles/roles.model';
import { UserRole } from '@backend/roles/user-roles.model';
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

    @ApiProperty({
        example: 1000,
        description: 'Total points earned by the user',
    })
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    })
    declare totalEarnedPoints: number;

    @ApiProperty({
        example: 500,
        description: 'Total points spent by the user',
    })
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    })
    declare totalSpentPoints: number;

    @ApiProperty({
        example: '+07:00',
        description: 'User\'s timezone',
    })
    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: '+00:00',
    })
    declare timezone: string;

    @BelongsToMany(() => Role, () => UserRole)
    declare roles: Role[];

    @HasMany(() => Task)
    declare tasks: Task[];
}