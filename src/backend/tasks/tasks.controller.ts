import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UseGuards,
    Patch,
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
import { DateTimeService } from '@backend/services/date-time.service';
import { Time } from '@backend/classes/Time';
import { PostponeTaskDto } from './dto/postpone-task.dto';

@ApiTags('Tasks')
@Controller('tasks')
@Roles('user')
@UseGuards(RolesGuard)
export class TasksController {
    constructor(
        private readonly tasksService: TasksService,
        private readonly dateTimeService: DateTimeService,
    ) { }

    @ApiOperation({ summary: 'Create a task' })
    @ApiResponse({ status: 200, type: Task })
    @ApiBody({ type: CreateTaskDto })
    @Post()
    public create(
        @Body() createTaskDto: CreateTaskDto,
    ): Promise<ITask> {
        return this.tasksService.createTask(createTaskDto);
    }

    @ApiOperation({ summary: 'Delete a task' })
    @ApiResponse({ status: 200, type: Number })
    @UseGuards(AuthorGuard)
    @Delete('/:id')
    public delete(@Param('id') id: number): Promise<number> {
        return this.tasksService.deleteTask(id);
    }

    @ApiOperation({ summary: 'Update a task' })
    @ApiResponse({ status: 200, type: Number })
    @UseGuards(AuthorGuard)
    @Patch('/:id')
    public update(
        @Param('id') id: number,
        @Body() taskDto: UpdateTaskDto,
    ): Promise<number> {
        return this.tasksService.updateTask(id, taskDto);
    }

    @ApiOperation({ summary: 'Appoint a task' })
    @ApiResponse({ status: 200, type: Task })
    @Post('/appoint')
    public appoint(): Promise<Task | null> {
        return this.tasksService.appointTask();
    }

    @ApiOperation({ summary: 'Complete a task' })
    @ApiResponse({ status: 200, type: Number })
    @UseGuards(AuthorGuard)
    @Post('/complete/:id')
    public complete(@Param('id') id: number): Promise<number> {
        return this.tasksService.completeTask(id);
    }

    @ApiOperation({ summary: 'Reject a task' })
    @ApiResponse({ status: 200, type: Number })
    @Post('/reject/:id')
    reject(@Param('id') id: number): Promise<number> {
        return this.tasksService.rejectTask(id);
    }

    @ApiOperation({ summary: 'Postpone a task' })
    @ApiResponse({ status: 200, type: Number })
    @Post('/postpone/:id')
    postpone(@Param('id') id: number, @Body() postponeTaskDto: PostponeTaskDto): Promise<number> {
        return this.tasksService.postponeTask(id, postponeTaskDto);
    }

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

    @ApiOperation({ summary: 'Get task by ID' })
    @ApiResponse({ status: 200, type: Task })
    @UseGuards(AuthorGuard)
    @Get('/:id')
    public async getById(@Param('id') id: number): Promise<Task> {
        const task = await this.tasksService.getTaskById(id);
        const offset = this.dateTimeService.getUserTimezoneOffsetInMinutes();
        
        // Adjust startTime and endTime for each period by the offset
        task.periods.forEach((period) => {
            if (period.startTime) {
                const startTime = new Time(period.startTime);
                period.startTime = startTime.addMinutes(offset).toString();
            }
            if (period.endTime) {
                const endTime = new Time(period.endTime);
                period.endTime = endTime.addMinutes(offset).toString();
            }
        });

        return task;
    }
}
