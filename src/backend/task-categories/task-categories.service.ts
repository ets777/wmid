import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTaskCategoryDto } from './dto/create-task-category.dto';
import { UpdateTaskCategoryDto } from './dto/update-task-category.dto';
import { InjectModel } from '@nestjs/sequelize';
import { TaskCategory } from './task-categories.model';

@Injectable()
export class TaskCategoriesService {
    constructor(
        @InjectModel(TaskCategory)
        private taskCategoryRepository: typeof TaskCategory,
    ) { }

    async createTaskCategory(
        createTaskCategoryDto: CreateTaskCategoryDto,
    ): Promise<TaskCategory> {
        createTaskCategoryDto.code = createTaskCategoryDto.code.toUpperCase();
        const taskCategory = await this.taskCategoryRepository.create(createTaskCategoryDto);

        return taskCategory;
    }

    async deleteTaskCategory(code: string): Promise<number> {
        const affectedRows = await this.taskCategoryRepository.destroy({
            where: { code: code.toUpperCase() },
        });

        return affectedRows;
    }

    async getTaskCategoryByCode(code: string): Promise<TaskCategory> {
        const task = await this.taskCategoryRepository.findOne({
            where: { code: code.toUpperCase() },
        });

        return task;
    }

    async getAllTaskCategories(): Promise<TaskCategory[]> {
        const taskCategories = await this.taskCategoryRepository.findAll({
            include: { all: true },
        });

        return taskCategories;
    }

    async updateTaskCategory(
        code: string,
        data: UpdateTaskCategoryDto,
    ): Promise<number> {
        const taskCategory = await this.taskCategoryRepository.findOne({
            where: { code: code.toUpperCase() },
        });

        if (!taskCategory) {
            throw new HttpException('Роль не найдена', HttpStatus.NOT_FOUND);
        }
        
        const updatedTaskCategory = await this.taskCategoryRepository.update(
            data,
            {
                where: { code: code.toUpperCase() },
            },
        );
        const [affectedRows] = updatedTaskCategory;

        return affectedRows;
    }
}
