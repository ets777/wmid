import {
    Column,
    DataType,
    ForeignKey,
    HasMany,
    Model,
    Table,
    BelongsTo,
} from 'sequelize-typescript';
import { Task } from '@backend/tasks/tasks.model';
import { Month, TaskPeriodType, Weekday } from './task-periods.enum';
import { TaskAppointment } from '@backend/task-appointments/task-appointments.model';

@Table({ tableName: 'task_periods', createdAt: false, updatedAt: false })
export class TaskPeriod extends Model<TaskPeriod> {
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    public declare typeId: TaskPeriodType;

    @ForeignKey(() => Task)
    public declare taskId: number;

    @BelongsTo(() => Task)
    public declare task: Task;

    @Column({
        type: DataType.TIME,
        allowNull: true,
    })
    public declare startTime: string;

    @Column({
        type: DataType.TIME,
        allowNull: true,
    })
    public declare endTime: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    public declare weekday: Weekday;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    public declare day: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    public declare month: Month;
    
    @Column({
        type: DataType.DATEONLY,
        allowNull: true,
    })
    public declare date: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    public declare offset: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    public declare isImportant: boolean;

    @HasMany(() => TaskAppointment)
    public declare appointments: TaskAppointment[];
}