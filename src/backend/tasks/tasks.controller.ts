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
import { Task } from './tasks.model';
import { ITask } from './tasks.interface';
import { DateTimeService } from '@backend/services/date-time.service';
import { Time } from '@backend/classes/Time';
import { PostponeTaskDto } from './dto/postpone-task.dto';

@Controller('tasks')
@Roles('user')
@UseGuards(RolesGuard)
export class TasksController {
    constructor(
        private readonly tasksService: TasksService,
        private readonly dateTimeService: DateTimeService,
    ) { }

    @Post()
    public create(
        @Body() createTaskDto: CreateTaskDto,
    ): Promise<ITask> {
        return this.tasksService.createTask(createTaskDto);
    }

    @UseGuards(AuthorGuard)
    @Delete('/:id')
    public delete(@Param('id') id: number): Promise<number> {
        return this.tasksService.deleteTask(id);
    }

    @UseGuards(AuthorGuard)
    @Patch('/:id')
    public update(
        @Param('id') id: number,
        @Body() taskDto: UpdateTaskDto,
    ): Promise<number> {
        return this.tasksService.updateTask(id, taskDto);
    }

    @Post('/appoint')
    public appoint(): Promise<Task | null> {
        return this.tasksService.appointTask();
    }

    @UseGuards(AuthorGuard)
    @Post('/complete/:id')
    public complete(@Param('id') id: number): Promise<number> {
        return this.tasksService.completeTask(id);
    }

    @Post('/reject/:id')
    reject(@Param('id') id: number): Promise<number> {
        return this.tasksService.rejectTask(id);
    }

    @Post('/postpone/:id')
    postpone(@Param('id') id: number, @Body() postponeTaskDto: PostponeTaskDto): Promise<number> {
        return this.tasksService.postponeTask(id, postponeTaskDto);
    }

    @Post('/buy/:id')
    buy(@Param('id') id: number): Promise<number> {
        return this.tasksService.buyTask(id);
    }

    @Post('/check/:id')
    check(@Param('id') id: number): Promise<boolean> {
        return this.tasksService.checkTask(id);
    }

    @Get()
    public getAll(): Promise<Task[]> {
        return this.tasksService.getAllTasks();
    }

    @Get('/getCurrent')
    public getCurrent(): Promise<Task> {
        return this.tasksService.getCurrentTask();
    }

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
