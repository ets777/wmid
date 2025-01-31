import { DateTimeService } from '@backend/services/date-time.service';
import { Injectable } from '@nestjs/common';
import { Task } from '@backend/tasks/tasks.model';

@Injectable()
export class TasksFilterService {
    constructor(
        private readonly dateTimeService: DateTimeService,
    ) { }

    actual(task: Task): boolean {
        const currentDate = this.dateTimeService.getCurrentDate();

        return (!task.startDate || currentDate >= task.startDate)
            && (!task.endDate || currentDate <= task.endDate);
    }

    nonDeleted(task: Task): boolean {
        return !task.isDeleted;
    }

    active(task: Task): boolean {
        return task.isActive;
    }
}