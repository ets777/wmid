import {
    BelongsToMany,
    Column,
    DataType,
    ForeignKey,
    HasMany,
    HasOne,
    Model,
    Table,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { TaskCategory } from '@backend/task-categories/task-categories.model';
import { User } from '@backend/users/users.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskPeriod } from '@backend/task-periods/task-periods.model';
import { TaskRelation } from '@backend/task-relations/task-relations.model';
import { ITask } from './tasks.interface';

@Table({ tableName: 'tasks' })
export class Task extends Model<Task, CreateTaskDto> implements ITask {
    @ApiProperty({
        example: 'Заправить кровать',
        description: 'Текст задания',
    })
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    public declare text: string;

    @ApiProperty({
        example: 10,
        description: 'Перерыв до следующего задания в минутах',
    })
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    public declare nextTaskBreak: number;

    @ApiProperty({
        example: '2010-01-01',
        description: 'Date from which the task is active',
    })
    @Column({
        type: DataType.DATEONLY,
        allowNull: true,
    })
    public declare startDate: string;

    @ApiProperty({
        example: '2050-01-01',
        description: 'Date till which the task is active',
    })
    @Column({
        type: DataType.DATEONLY,
        allowNull: true,
    })
    public declare endDate: string;

    @ApiProperty({
        example: 20,
        description: 'Продолжительность задания в минутах',
    })
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    public declare duration: number;

    @ApiProperty({
        example: true,
        description: 'Флаг активности',
    })
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    })
    public declare isActive: boolean;

    @ApiProperty({
        example: false,
        description: 'Флаг удалённого задания',
    })
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    public declare isDeleted: boolean;

    @ApiProperty({
        example: false,
        description: 'Is task should be appointed if overdue.',
    })
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    public declare willBeAppointedIfOverdue: boolean;

    @ApiProperty({
        example: 100,
        description: 'Task cost in points',
    })
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    public declare cost: number;

    @ApiProperty({
        example: true,
        description: 'Is task a reward',
    })
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    public declare isReward: boolean;

    @ApiProperty({
        example: 1,
        description: 'ID следующего задания',
    })
    @ForeignKey(() => Task)
    public declare nextTaskId: number;

    @ApiProperty({
        example: 1,
        description: 'ID категории',
    })
    @ForeignKey(() => TaskCategory)
    public declare categoryId: number;

    @ApiProperty({
        example: 10,
        description: 'Cooldown from last appointment. Units depends on period type (minutes for daily, days for weekly, monthly, yearly and once)',
    })
    @Column({
        type: DataType.NUMBER,
        allowNull: true,
    })
    public declare cooldown: number;

    @ApiProperty({
        example: 1,
        description: 'ID автора',
    })
    @ForeignKey(() => User)
    public declare userId: number;

    @HasOne(() => Task, { foreignKey: 'nextTaskId', sourceKey: 'id' })
    public declare previousTask: Task;

    @HasMany(() => TaskPeriod)
    public declare periods: TaskPeriod[];

    @HasMany(() => TaskRelation, 'mainTaskId')
    public declare relatedTasks: TaskRelation[];


    @BelongsToMany(() => Task, () => TaskRelation, 'mainTaskId', 'relatedTaskId')
    public declare additionalTasks: Task[];

    @BelongsToMany(() => Task, () => TaskRelation, 'relatedTaskId', 'mainTaskId')
    public declare mainTasks: Task[];
}