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
import { TaskCategory } from '@backend/task-categories/task-categories.model';
import { User } from '@backend/users/users.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskPeriod } from '@backend/task-periods/task-periods.model';
import { TaskRelation } from '@backend/task-relations/task-relations.model';
import { ITask } from './tasks.interface';

@Table({ tableName: 'tasks' })
export class Task extends Model<Task, CreateTaskDto> implements ITask {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    public declare text: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    public declare nextTaskBreak: number;

    @Column({
        type: DataType.DATEONLY,
        allowNull: true,
    })
    public declare startDate: string;

    @Column({
        type: DataType.DATEONLY,
        allowNull: true,
    })
    public declare endDate: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    public declare duration: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    })
    public declare isActive: boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    public declare isDeleted: boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    public declare willBeAppointedIfOverdue: boolean;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    public declare cost: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    public declare isReward: boolean;

    @ForeignKey(() => Task)
    public declare nextTaskId: number;

    @ForeignKey(() => TaskCategory)
    public declare categoryId: number;

    @Column({
        type: DataType.NUMBER,
        allowNull: true,
    })
    public declare cooldown: number;

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