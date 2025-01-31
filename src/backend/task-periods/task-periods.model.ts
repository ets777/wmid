import {
    Column,
    DataType,
    ForeignKey,
    HasMany,
    Model,
    Table,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Task } from '../tasks/tasks.model';
import { Month, TaskPeriodType, Weekday } from './task-periods.enum';
import { TaskAppointment } from '@backend/task-appointments/task-appointments.model';

@Table({ tableName: 'task_periods', createdAt: false, updatedAt: false })
export class TaskPeriod extends Model<TaskPeriod> {
    @ApiProperty({
        example: 1,
        description: 'Period type id',
    })
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare typeId: TaskPeriodType;

    @ApiProperty({
        example: 1,
        description: 'Task id',
    })
    @ForeignKey(() => Task)
    declare taskId: number;

    @ApiProperty({
        example: '07:58:00',
        description: 'Period start time',
    })
    @Column({
        type: DataType.TIME,
        allowNull: true,
    })
    declare startTime: string;

    @ApiProperty({
        example: '17:58:00',
        description: 'Period end time',
    })
    @Column({
        type: DataType.TIME,
        allowNull: true,
    })
    declare endTime: string;

    @ApiProperty({
        example: 1,
        description: 'Day of the week',
    })
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    declare weekday: Weekday;

    @ApiProperty({
        example: 1,
        description: 'Day of the month',
    })
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    declare day: number;

    @ApiProperty({
        example: 1,
        description: 'Month',
    })
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    declare month: Month;
    
    @ApiProperty({
        example: '2024-10-28',
        description: 'Date',
    })
    @Column({
        type: DataType.DATEONLY,
        allowNull: true,
    })
    declare date: string;

    @ApiProperty({
        example: 10,
        description: 'Cooldown from last appointment. Units depends on period type (hours for daily, days for weekly, monthly, yearly and once)',
    })
    @Column({
        type: DataType.NUMBER,
        allowNull: true,
    })
    declare cooldown: number;

    @ApiProperty({
        example: 15,
        description: 'Offset from task period time in minutes',
    })
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    declare offset: number;

    @ApiProperty({
        example: false,
        description: 'Importance flag',
    })
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare isImportant: boolean;

    @HasMany(() => TaskAppointment)
    declare appointments: TaskAppointment[];
}