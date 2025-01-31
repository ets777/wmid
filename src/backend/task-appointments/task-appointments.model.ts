import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Status } from './task-appointments.enum';
import { TaskPeriod } from '@backend/task-periods/task-periods.model';

@Table({ tableName: 'task_appointments', createdAt: false, updatedAt: false })
export class TaskAppointment extends Model<TaskAppointment> {
    @ApiProperty({
        example: 1,
        description: 'ID статуса назначения',
    })
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare statusId: Status;

    @ApiProperty({
        example: '2024-10-28 12:00:00',
        description: 'Start date and time of appointment',
    })
    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    declare startDate: string;

    @ApiProperty({
        example: '2024-10-28 12:01:00',
        description: 'End date and time of appointment',
    })
    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    declare endDate: string;

    @ApiProperty({
        example: false,
        description: 'Дополнительное назначение',
    })
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare isAdditional: boolean;

    @ApiProperty({
        example: 1,
        description: 'Task period ID',
    })
    @ForeignKey(() => TaskPeriod)
    declare taskPeriodId: number;

    @BelongsTo(() => TaskPeriod)
    taskPeriod: TaskPeriod;
}