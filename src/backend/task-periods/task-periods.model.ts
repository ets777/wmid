import {
    Column,
    DataType,
    ForeignKey,
    HasMany,
    Model,
    Table,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Task } from '@backend/tasks/tasks.model';
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
    public declare typeId: TaskPeriodType;

    @ApiProperty({
        example: 1,
        description: 'Task id',
    })
    @ForeignKey(() => Task)
    public declare taskId: number;

    @ApiProperty({
        example: '07:58:00',
        description: 'Period start time',
    })
    @Column({
        type: DataType.TIME,
        allowNull: true,
    })
    public declare startTime: string;

    @ApiProperty({
        example: '17:58:00',
        description: 'Period end time',
    })
    @Column({
        type: DataType.TIME,
        allowNull: true,
    })
    public declare endTime: string;

    @ApiProperty({
        example: 1,
        description: 'Day of the week',
    })
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    public declare weekday: Weekday;

    @ApiProperty({
        example: 1,
        description: 'Day of the month',
    })
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    public declare day: number;

    @ApiProperty({
        example: 1,
        description: 'Month',
    })
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    public declare month: Month;
    
    @ApiProperty({
        example: '2024-10-28',
        description: 'Date',
    })
    @Column({
        type: DataType.DATEONLY,
        allowNull: true,
    })
    public declare date: string;

    @ApiProperty({
        example: 10,
        description: 'Cooldown from last appointment. Units depends on period type (hours for daily, days for weekly, monthly, yearly and once)',
    })
    @Column({
        type: DataType.NUMBER,
        allowNull: true,
    })
    public declare cooldown: number;

    @ApiProperty({
        example: 15,
        description: 'Offset from task period time in minutes',
    })
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    public declare offset: number;

    @ApiProperty({
        example: false,
        description: 'Importance flag',
    })
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    public declare isImportant: boolean;

    @HasMany(() => TaskAppointment)
    public declare appointments: TaskAppointment[];
}