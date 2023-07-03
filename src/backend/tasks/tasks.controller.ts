import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  Patch,
  Req,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { Task } from './tasks.model';
import { CreateTaskControllerDto } from './dto/create-task-controller.dto';
import { RolesGuard } from 'auth/guards/roles.guard';
import { AccessTokenGuard } from 'auth/guards/accessToken.guard';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthorGuard } from './guards/author.guard';
import { Roles } from '../auth/roles-auth.decorator';

@ApiTags('Задания')
@Controller('tasks')
@Roles('user')
@UseGuards(AccessTokenGuard, RolesGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @ApiOperation({ summary: 'Создание задания' })
  @ApiResponse({ status: 200, type: Task })
  @ApiBody({ type: CreateTaskControllerDto })
  @Post()
  create(@Body() dto: CreateTaskControllerDto, @Req() req: any): Promise<Task> {
    delete req.user.iat;
    delete req.user.exp;

    return this.tasksService.createTask(dto, req.user);
  }

  @ApiOperation({ summary: 'Удаление задания' })
  @ApiResponse({ status: 200, type: Number })
  @UseGuards(AuthorGuard)
  @Delete('/:id')
  delete(@Param('id') id: number): Promise<number> {
    return this.tasksService.deleteTask(id);
  }

  @ApiOperation({ summary: 'Выбор задания по ID' })
  @ApiResponse({ status: 200, type: Task })
  @UseGuards(AuthorGuard)
  @Get('/:id')
  getById(@Param('id') id: number): Promise<Task> {
    return this.tasksService.getTaskById(id);
  }

  @ApiOperation({ summary: 'Получение всех заданий' })
  @ApiResponse({ status: 200, type: [Task] })
  @Get()
  getAll(): Promise<Task[]> {
    return this.tasksService.getAllTasks();
  }

  @ApiOperation({ summary: 'Обновление задания' })
  @ApiResponse({ status: 200, type: Number })
  @UseGuards(AuthorGuard)
  @Patch('/:id')
  update(
    @Param('id') id: number,
    @Body() taskDto: UpdateTaskDto,
  ): Promise<number> {
    return this.tasksService.updateTask(id, taskDto);
  }
}
