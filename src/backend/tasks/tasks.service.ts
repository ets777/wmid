import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Task } from './tasks.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateTaskControllerDto } from './dto/create-task-controller.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { DeleteTaskDto } from './dto/delete-task.dto';
import { TaskPeriodsService } from 'task-periods/task-periods.service';
import { CreateTaskPeriodDto } from 'task-periods/dto/create-task-period.dto';
import { UserFromTokenDto } from 'users/dto/user-from-token.dto';
import { CreateTaskServiceDto } from './dto/create-task-service.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task) private taskRepository: typeof Task,
    private taskPeriodsService: TaskPeriodsService,
  ) {}

  async createTask(
    createTaskControllerDto: CreateTaskControllerDto,
    userFromTokenDto: UserFromTokenDto,
  ): Promise<Task> {
    const createTaskServiceDto: CreateTaskServiceDto = {
      ...createTaskControllerDto,
      userId: userFromTokenDto.id,
    };
    const task = await this.taskRepository.create(createTaskServiceDto);

    if (
      Array.isArray(createTaskServiceDto.periods) &&
      createTaskServiceDto.periods.length > 0
    ) {
      createTaskServiceDto.periods.forEach((period: CreateTaskPeriodDto) => {
        period.taskId = task.id;
        this.taskPeriodsService.createTaskPeriod(period);
      });
    }

    return task;
  }

  async deleteTask(id: number): Promise<number> {
    const task = await this.taskRepository.findOne({
      where: { id },
    });

    if (!task) {
      throw new HttpException('Задание не найдено', HttpStatus.NOT_FOUND);
    }

    const filteredData: DeleteTaskDto = {
      deleted: true,
    };

    const updatedData = {
      ...task,
      ...filteredData,
    };

    const updatedTask = await this.taskRepository.update(updatedData, {
      where: { id },
    });

    const [affectedRows] = updatedTask;

    return affectedRows;
  }

  async getTaskById(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    return task;
  }

  async getAllTasks(): Promise<Task[]> {
    const tasks = await this.taskRepository.findAll({ include: { all: true } });
    return tasks;
  }

  async updateTask(id: number, data: UpdateTaskDto): Promise<number> {
    const task = await this.taskRepository.findOne({
      where: { id },
    });

    if (!task) {
      throw new HttpException('Задание не найдено', HttpStatus.NOT_FOUND);
    }

    const filteredData: UpdateTaskDto = {};

    if (data.nextTaskBreak) filteredData.nextTaskBreak = data.nextTaskBreak;
    if (data.categoryId) filteredData.categoryId = data.categoryId;
    if (data.nextTaskId) filteredData.nextTaskId = data.nextTaskId;
    if (data.important) filteredData.important = data.important;
    if (data.duration) filteredData.duration = data.duration;
    if (data.cooldown) filteredData.cooldown = data.cooldown;
    if (data.endDate) filteredData.endDate = data.endDate;
    if (data.active) filteredData.active = data.active;
    if (data.offset) filteredData.offset = data.offset;
    if (data.text) filteredData.text = data.text;

    const updatedData = {
      ...task,
      ...filteredData,
    };

    const updatedTask = await this.taskRepository.update(updatedData, {
      where: { id },
    });

    const [affectedRows] = updatedTask;

    return affectedRows;
  }
}
