import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TaskPeriod } from './task-periods.model';
import { CreateTaskPeriodDto } from './dto/create-task-period.dto';

@Injectable()
export class TaskPeriodsService {
  constructor(
    @InjectModel(TaskPeriod)
    private taskPeriodRepository: typeof TaskPeriod,
  ) {}

  async createTaskPeriod(dto: CreateTaskPeriodDto): Promise<TaskPeriod> {
    const task = await this.taskPeriodRepository.create(dto);
    return task;
  }

  async deleteTaskPeriod(id: number): Promise<number> {
    const affectedRows = await this.taskPeriodRepository.destroy({
      where: { id },
    });
    return affectedRows;
  }

  async getTaskCategoryById(id: number): Promise<TaskPeriod> {
    const task = await this.taskPeriodRepository.findOne({ where: { id } });
    return task;
  }
}
