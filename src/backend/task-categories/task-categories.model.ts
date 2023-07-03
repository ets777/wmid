import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Task } from 'tasks/tasks.model';
import { CreateTaskCategoryDto } from './dto/create-task-category.dto';

@Table({ tableName: 'task_categories', createdAt: false, updatedAt: false })
export class TaskCategory extends Model<TaskCategory, CreateTaskCategoryDto> {
  @ApiProperty({
    example: 'Хобби',
    description: 'Название категории',
  })
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  name: string;

  @ApiProperty({
    example: 'HOBBY',
    description: 'Код категории',
  })
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  code: string;

  @HasMany(() => Task)
  tasks: Task[];
}
