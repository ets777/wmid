import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Task } from '@backend/tasks/tasks.model';
import { CreateTaskCategoryDto } from './dto/create-task-category.dto';

@Table({ tableName: 'task_categories', createdAt: false, updatedAt: false })
export class TaskCategory extends Model<TaskCategory, CreateTaskCategoryDto> {

    @ApiProperty({
        example: 'Hobby',
        description: 'Category name',
    })
    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: false,
    })
    declare name: string;

    @ApiProperty({
        example: 'HOBBY',
        description: 'Category code',
    })
    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: false,
    })
    declare code: string;

    @HasMany(() => Task)
    tasks: Task[];
}