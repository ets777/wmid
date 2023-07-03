import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Task } from 'tasks/tasks.model';
import { Month, TaskPeriodType, Weekday } from './task-periods.enum';

@Table({ tableName: 'task_periods', createdAt: false, updatedAt: false })
export class TaskPeriod extends Model<TaskPeriod> {
  @ApiProperty({
    example: 1,
    description: 'ID типа периода',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  typeId: TaskPeriodType;

  @ApiProperty({
    example: 1,
    description: 'ID задания',
  })
  @ForeignKey(() => Task)
  taskId: number;

  @ApiProperty({
    example: '07:58:00',
    description: 'Время начала действия периода',
  })
  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  startTime: string;

  @ApiProperty({
    example: '17:58:00',
    description: 'Время окончания действия периода',
  })
  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  endTime: string;

  @ApiProperty({
    example: 1,
    description: 'День недели действия периода',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  weekday: Weekday;

  @ApiProperty({
    example: 1,
    description: 'День месяца действия периода',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  day: number;

  @ApiProperty({
    example: 1,
    description: 'Месяц действия периода',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  month: Month;

  @ApiProperty({
    example: '2024-10-28',
    description: 'Дата действия периода',
  })
  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  date: string;
}
