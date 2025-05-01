import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTaskRelationDto } from './dto/create-task-relation.dto';
import { InjectModel } from '@nestjs/sequelize';
import { TaskRelation } from './task-relations.model';
import { TaskRelationType } from './task-relations.enum';
import { DeleteTaskRelationDto } from './dto/delete-task-relation.dto';
import { Task } from '@backend/tasks/tasks.model';
import { Op } from 'sequelize';

@Injectable()
export class TaskRelationsService {
    constructor(
        @InjectModel(TaskRelation)
        private taskRelationRepository: typeof TaskRelation,
    ) { }

    async createTaskRelation(
        createTaskRelationDto: CreateTaskRelationDto,
    ): Promise<TaskRelation> {
        const taskRelation = await this.taskRelationRepository.create(
            createTaskRelationDto,
        );

        return taskRelation;
    }

    async deleteTaskRelation(
        deleteTaskRelationDto: DeleteTaskRelationDto,
    ): Promise<number> {
        const affectedRows = await this.taskRelationRepository.destroy({
            where: { 
                ...deleteTaskRelationDto,
            },
        });

        return affectedRows;
    }

    async deleteTaskRelations(mainTaskId: number, relationType: TaskRelationType): Promise<number> {
        const affectedRows = await this.taskRelationRepository.destroy({
            where: { 
                mainTaskId,
                relationType,
            },
        });

        return affectedRows;
    }

    async getTaskRelationById(id: number): Promise<TaskRelation> {
        const task = await this.taskRelationRepository.findOne({
            where: { id },
        });

        return task;
    }

    async getAllTaskCategories(): Promise<TaskRelation[]> {
        const taskCategories = await this.taskRelationRepository.findAll({
            include: { all: true },
        });

        return taskCategories;
    }

    async updateTaskRelation(
        id: number,
        data: CreateTaskRelationDto,
    ): Promise<number> {
        const taskRelation = await this.taskRelationRepository.findOne({
            where: { id },
        });

        if (!taskRelation) {
            throw new HttpException('Task relation not found', HttpStatus.NOT_FOUND);
        }

        const updatedTaskRelation = await this.taskRelationRepository.update(
            data,
            {
                where: { id },
            },
        );
        const [affectedRows] = updatedTaskRelation;

        return affectedRows;
    }

    async getAllAdditionalTasks(mainTask: Task): Promise<TaskRelation[]> {
        const taskRelations = await this.taskRelationRepository.findAll({
            include: [
                { all: true },
            ],
            where: {
                [Op.and]: [
                    {
                        mainTaskId: mainTask.id,
                    },
                    {
                        relationType: TaskRelationType.ADDITIONAL,
                    },
                ],
            },
        });

        return taskRelations;
    }

    async getTaskRelationsByTaskId(taskId: number): Promise<TaskRelation[]> {
        const task = await this.taskRelationRepository.findAll({
            where: { mainTaskId: taskId },
        });

        return task;
    }
}
