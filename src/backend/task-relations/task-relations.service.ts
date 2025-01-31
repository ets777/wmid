import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTaskRelationDto } from './dto/create-task-relation.dto';
import { InjectModel } from '@nestjs/sequelize';
import { TaskRelation } from './task-relations.model';
import { Task } from '@backend/tasks/tasks.model';
import { Op } from 'sequelize';
import { TaskRelationType } from './task-relations.enum';

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

    async deleteTaskRelation(id: number): Promise<number> {
        const affectedRows = await this.taskRelationRepository.destroy({
            where: { id },
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

    // async getAllAdditionalTasks(mainTask: Task): Promise<Task[]> {
    //     const taskRelations = await this.taskRelationRepository.findAll({
    //         where: {
    //             [Op.and]: [
    //                 {
    //                     mainTaskId: mainTask.id,
    //                 },
    //                 {
    //                     relationType: TaskRelationType.ADDITIONAL,
    //                 }
    //             ],
    //         },
    //     });

    //     const additionalTasks = taskRelations.map(
    //         (taskRelation) => taskRelation.relatedTaskId,
    //     );

    //     return additionalTasks;
    // }
}
