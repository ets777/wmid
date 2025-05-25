import { DateTimeService } from '@backend/services/date-time.service';
import { Injectable } from '@nestjs/common';
import { Task } from '@backend/tasks/tasks.model';
import { CurrentUserService } from '@backend/services/current-user.service';
import { TaskPeriodType } from '@backend/task-periods/task-periods.enum';
import { format } from 'date-fns';
import { Time } from '@backend/classes/Time';

@Injectable()
export class TasksFilterService {
    constructor(
        private readonly dateTimeService: DateTimeService,
        private readonly currentUserService: CurrentUserService,
    ) { }

    actual(task: Task): boolean {
        const currentDate = this.dateTimeService.getUserCurrentDate();

        return (!task.startDate || currentDate >= task.startDate)
            && (!task.endDate || currentDate <= task.endDate);
    }

    isNotDeleted(task: Task): boolean {
        return !task.isDeleted;
    }

    isNotReward(task: Task): boolean {
        return !task.isReward;
    }

    active(task: Task): boolean {
        return task.isActive;
    }

    byAuthor(task: Task): boolean {
        const currentUser = this.currentUserService.getCurrentUser();
        return currentUser && task.userId === currentUser.id;
    }

    overdue(task: Task): boolean {
        return task.willBeAppointedIfOverdue;
    }

    cooldown(task: Task): boolean {
        if (!task.periods?.length) {
            return true;
        }

        // Get all appointments across all periods
        const allAppointments = task.periods.flatMap((period) => period.appointments || []);

        if (!allAppointments.length) {
            return true;
        }

        // Find the latest appointment
        const [latestAppointment] = allAppointments.sort(
            (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
        );

        if (!latestAppointment?.endDate) {
            return true;
        }

        // Use the period that corresponds to the latest appointment
        const period = task.periods.find((period) => period.id === latestAppointment.taskPeriodId);

        // Skip cooldown check for one-time tasks
        if (period.typeId === TaskPeriodType.ONCE) {
            return true;
        }

        const timeFunction = this.dateTimeService
            .getTimeFunctionDuePeriodType(period.typeId);

        const lastAppointmentEndDate = latestAppointment.endDate;
        const cooldownEndDate = format(
            timeFunction(lastAppointmentEndDate, task.cooldown),
            'yyyy-MM-dd HH:mm:ss',
        );
        const currentDateTime = this.dateTimeService.getCurrentDateTime();

        return cooldownEndDate <= currentDateTime;
    }

    noPreviousTask(tasks: Task[]): (task: Task) => boolean {
        return (task: Task) => !tasks.some((t) => t.nextTaskId === task.id);
    }

    noTimeTaskInChain(tasks: Task[]): (task: Task) => boolean {
        return ((task: Task) => {
            const chain = this.getTaskChain(task, tasks);

            return !chain.some((t) => t.periods.some((p) => p.startTime));
        });
    }

    /**
     * TODO: use offset and isImportant flag to decide if it's enough time
     */
    enoughTime(nearestTimeTask: Task): (task: Task) => boolean {
        const nearestTime = nearestTimeTask?.periods[0]?.startTime;
        const currentTime = this.dateTimeService.getCurrentTime();

        return (task: Task) => (
            nearestTime 
                ? new Time(nearestTime) > new Time(currentTime).addMinutes(task.duration) 
                : true
        );
    }

    private getTaskChain(task: Task, tasks: Task[]): Task[] {
        const chain = [task];
        const nextTask = tasks.find((t) => t.id === task.nextTaskId);

        if (nextTask) {
            chain.push(...this.getTaskChain(nextTask, tasks));
        }

        return chain;
    }
}