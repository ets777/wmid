import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { TasksService } from '../tasks.service';

@Injectable()
export class AuthorGuard implements CanActivate {
    constructor(private tasksService: TasksService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const req = context.switchToHttp().getRequest();
            const taskId = req.params.id;
            const userId = req.user.id;
            const task = await this.tasksService.getTaskById(taskId);

            return task.userId === userId;
        } catch (e) {
            throw new HttpException('Нет доступа', HttpStatus.FORBIDDEN);
        }
    }
}
