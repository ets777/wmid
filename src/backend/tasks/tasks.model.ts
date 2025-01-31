import {
    BelongsToMany,
    Column,
    DataType,
    ForeignKey,
    HasMany,
    HasOne,
    Model,
    Scopes,
    Table,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { TaskCategory } from '@backend/task-categories/task-categories.model';
import { User } from '@backend/users/users.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskPeriod } from '@backend/task-periods/task-periods.model';
import { TaskRelation } from '@backend/task-relations/task-relations.model';

@Scopes(() => ({
    additionalTasks: {
        include: [{
            model: TaskRelation,
            where: { relationType: 'additional' },
        }],
    },
}))
@Table({ tableName: 'tasks' })
export class Task extends Model<Task, CreateTaskDto> {
    @ApiProperty({
        example: 'Заправить кровать',
        description: 'Текст задания',
    })
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare text: string;

    @ApiProperty({
        example: 10,
        description: 'Перерыв до следующего задания в минутах',
    })
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    declare nextTaskBreak: number;

    @ApiProperty({
        example: '2010-01-01',
        description: 'Date from which the task is active',
    })
    @Column({
        type: DataType.DATEONLY,
        allowNull: true,
    })
    declare startDate: string;

    @ApiProperty({
        example: '2050-01-01',
        description: 'Date till which the task is active',
    })
    @Column({
        type: DataType.DATEONLY,
        allowNull: true,
    })
    declare endDate: string;

    @ApiProperty({
        example: 20,
        description: 'Продолжительность задания в минутах',
    })
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare duration: number;

    @ApiProperty({
        example: true,
        description: 'Флаг активности',
    })
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    })
    declare isActive: boolean;

    @ApiProperty({
        example: false,
        description: 'Флаг удалённого задания',
    })
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare isDeleted: boolean;

    @ApiProperty({
        example: 1,
        description: 'ID следующего задания',
    })
    @ForeignKey(() => Task)
    declare nextTaskId: number;

    @ApiProperty({
        example: 1,
        description: 'ID категории',
    })
    @ForeignKey(() => TaskCategory)
    declare categoryId: number;

    @ApiProperty({
        example: 1,
        description: 'ID автора',
    })
    @ForeignKey(() => User)
    declare userId: number;

    @HasOne(() => Task, { foreignKey: 'nextTaskId', sourceKey: 'id' })
    declare previousTask: Task;

    @HasMany(() => TaskPeriod)
    declare periods: TaskPeriod[];

    @HasMany(() => TaskRelation, 'mainTaskId')
    declare relatedTasks: TaskRelation[];

    @BelongsToMany(() => Task, {
        through: {
            model: () => TaskRelation,
            unique: false,
            scope: { relationType: 'additional' },
        },
        foreignKey: 'mainTaskId',
        otherKey: 'relatedTaskId',
        as: 'additionalTasks',
    })
    declare additionalTasks: Task[];
}