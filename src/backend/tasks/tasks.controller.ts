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
import { CreateTaskDto } from './dto/create-task.dto';
import { RolesGuard } from '@backend/roles/guards/roles.guard';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthorGuard } from './guards/author.guard';
import { Roles } from '@backend/auth/roles-auth.decorator';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Task } from './tasks.model';
import { ITask } from './tasks.interface';

@ApiTags('Tasks')
@Controller('tasks')
@Roles('user')
@UseGuards(RolesGuard)
export class TasksController {
    constructor(
        private readonly tasksService: TasksService,
    ) { }

    @ApiOperation({ summary: 'Create a task' })
    @ApiResponse({ status: 200, type: Task })
    @ApiBody({ type: CreateTaskDto })
    @Post()
    public create(
        @Body() dto: CreateTaskDto,
        @Req() req: any,
    ): Promise<ITask> {
        return this.tasksService.createTask(dto, req.user);
    }

    @ApiOperation({ summary: 'Удаление задания' })
    @ApiResponse({ status: 200, type: Number })
    @UseGuards(AuthorGuard)
    @Delete('/:id')
    public delete(@Param('id') id: number): Promise<number> {
        return this.tasksService.deleteTask(id);
    }

    @ApiOperation({ summary: 'Task update' })
    @ApiResponse({ status: 200, type: Number })
    @UseGuards(AuthorGuard)
    @Patch('/:id')
    public update(
        @Param('id') id: number,
        @Body() taskDto: UpdateTaskDto,
    ): Promise<number> {
        return this.tasksService.updateTask(id, taskDto);
    }

    @ApiOperation({ summary: 'Назначение задания' })
    @ApiResponse({ status: 200, type: Task })
    @Post('/appoint')
    public appoint(): Promise<Task | null> {
        return this.tasksService.appointTask();
    }

    @ApiOperation({ summary: 'Завершение задания' })
    @ApiResponse({ status: 200, type: Number })
    @UseGuards(AuthorGuard)
    @Post('/complete/:id')
    public complete(@Param('id') id: number): Promise<number> {
        return this.tasksService.completeTask(id);
    }

    // @ApiOperation({ summary: 'Отмена задания' })
    // @ApiResponse({ status: 200, type: Number })
    // @Post('/reject')
    // reject(@Body() appointedTaskDto: AppointedTaskDto): Promise<number> {
    //     return this.tasksService.rejectTask(appointedTaskDto);
    // }

    // @ApiOperation({ summary: 'Перенос задания' })
    // @ApiResponse({ status: 200, type: Number })
    // @Post('/postpone')
    // postpone(@Body() appointedTaskDto: AppointedTaskDto): Promise<number> {
    //     return this.tasksService.postponeTask(appointedTaskDto);
    // }

    @ApiOperation({ summary: 'Получение всех заданий' })
    @ApiResponse({ status: 200, type: [Task] })
    @Get()
    public getAll(): Promise<Task[]> {
        return this.tasksService.getAllTasks();
    }

    @ApiOperation({ summary: 'Получение текущего задания' })
    @ApiResponse({ status: 200, type: Task })
    @Get('/getCurrent')
    public getCurrent(): Promise<Task> {
        return this.tasksService.getCurrentTask();
    }

    @ApiOperation({ summary: 'Выбор задания по ID' })
    @ApiResponse({ status: 200, type: Task })
    @UseGuards(AuthorGuard)
    @Get('/:id')
    public getById(@Param('id') id: number): Promise<Task> {
        return this.tasksService.getTaskById(id);
    }
}
