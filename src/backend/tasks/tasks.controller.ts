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
import { TasksService } from './tasks.service';
import { ITask } from './tasks.interface';
import { CreateTaskControllerDto } from './dto/create-task-controller.dto';
import { RolesGuard } from '@backend/auth/guards/roles.guard';
import { AccessTokenGuard } from '@backend/auth/guards/accessToken.guard';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthorGuard } from './guards/author.guard';
import { Roles } from '@backend/auth/roles-auth.decorator';
import { AppointedTaskDto } from './dto/apointed-task.dto';
import { AppointTaskParamsDto } from './dto/apointed-task-params.dto';

@Controller('tasks')
@Roles('user')
@UseGuards(AccessTokenGuard, RolesGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  create(
    @Body() dto: CreateTaskControllerDto,
    @Req() req: any,
  ): Promise<number> {
    delete req.user.iat;
    delete req.user.exp;

    return this.tasksService.createTask(dto, req.user);
  }

  @UseGuards(AuthorGuard)
  @Delete('/:id')
  delete(@Param('id') id: number): Promise<number> {
    return this.tasksService.deleteTask(id);
  }

  @UseGuards(AuthorGuard)
  @Patch('/:id')
  update(
    @Param('id') id: number,
    @Body() taskDto: UpdateTaskDto,
  ): Promise<number> {
    return this.tasksService.updateTask(id, taskDto);
  }

  @Post('/appoint')
  appoint(
    @Body() appointTaskParamsDto: AppointTaskParamsDto,
  ): Promise<AppointedTaskDto | null> {
    return this.tasksService.appointTask(appointTaskParamsDto);
  }

  @Post('/complete')
  complete(@Body() appointedTaskDto: AppointedTaskDto): Promise<number> {
    return this.tasksService.completeTask(appointedTaskDto);
  }

  @Post('/reject')
  reject(@Body() appointedTaskDto: AppointedTaskDto): Promise<number> {
    return this.tasksService.rejectTask(appointedTaskDto);
  }

  @Post('/postpone')
  postpone(@Body() appointedTaskDto: AppointedTaskDto): Promise<number> {
    return this.tasksService.postponeTask(appointedTaskDto);
  }

  @Get()
  getAll(): Promise<ITask[]> {
    return this.tasksService.getAllTasks();
  }

  @Get('/getCurrent')
  getCurrent(): Promise<AppointedTaskDto> {
    return this.tasksService.getCurrent();
  }

  @UseGuards(AuthorGuard)
  @Get('/:id')
  getById(@Param('id') id: number): Promise<ITask> {
    return this.tasksService.getTaskById(id);
  }
}
