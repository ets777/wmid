import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { TasksService } from '@backend/tasks/tasks.service';
import { CurrentUserService } from '@backend/services/current-user.service';

@Injectable()
export class AuthorGuard implements CanActivate {
    constructor(
        private tasksService: TasksService,
        private currentUserService: CurrentUserService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const req = context.switchToHttp().getRequest();
            const taskId = req.params.id;
            const userId = this.currentUserService.getCurrentUser()?.id;
            const task = await this.tasksService.getTaskById(taskId);

            return task.userId === userId;
        } catch {
            throw new HttpException('Нет доступа', HttpStatus.FORBIDDEN);
        }
    }
}
