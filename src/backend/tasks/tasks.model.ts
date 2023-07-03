import {
  Column,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { TaskCategory } from 'task-categories/task-categories.model';
import { User } from 'users/users.model';
import { CreateTaskServiceDto } from './dto/create-task-service.dto';
import { TaskPeriod } from 'task-periods/task-periods.model';

@Table({ tableName: 'tasks' })
export class Task extends Model<Task, CreateTaskServiceDto> {
  @ApiProperty({
    example: 'Заправить кровать',
    description: 'Текст задания',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  text: string;

  @ApiProperty({
    example: 10,
    description: 'Перерыв до следующего задания в минутах',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  nextTaskBreak: number;

  @ApiProperty({
    example: '2050-01-01',
    description: 'Дата, до которой задание будет активно',
  })
  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  endDate: string;

  @ApiProperty({
    example: 15,
    description: 'Смещение начала задания в минутах',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  offset: number;

  @ApiProperty({
    example: 20,
    description: 'Продолжительность задания в минутах',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  duration: number;

  @ApiProperty({
    example: true,
    description: 'Флаг активности',
  })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  active: boolean;

  @ApiProperty({
    example: false,
    description: 'Флаг удалённого задания',
  })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  deleted: boolean;

  @ApiProperty({
    example: 2,
    description:
      'Перерыв до следующего назначения. Единицы зависят от периодичности задания',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  cooldown: number;

  @ApiProperty({
    example: false,
    description: 'Флаг важности',
  })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  important: boolean;

  @ApiProperty({
    example: 1,
    description: 'ID следующего задания',
  })
  @ForeignKey(() => Task)
  nextTaskId: number;

  @ApiProperty({
    example: 1,
    description: 'ID категории',
  })
  @ForeignKey(() => TaskCategory)
  categoryId: number;

  @ApiProperty({
    example: 1,
    description: 'ID автора',
  })
  @ForeignKey(() => User)
  userId: number;

  @HasOne(() => Task)
  previousTask: Task;

  @HasMany(() => TaskPeriod)
  periods: TaskPeriod[];
}
