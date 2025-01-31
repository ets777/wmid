import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Task } from '@backend/tasks/tasks.model';
import { CreateTaskRelationDto } from './dto/create-task-relation.dto';
import { TaskRelationType } from './task-relations.enum';

@Table({ tableName: 'task_relations', createdAt: false, updatedAt: false })
export class TaskRelation extends Model<TaskRelation, CreateTaskRelationDto> {

    @ForeignKey(() => Task)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare mainTaskId: number;

    @ForeignKey(() => Task)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare relatedTaskId: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare relationType: TaskRelationType;
}