import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskPeriodsService } from '@backend/task-periods/task-periods.service';
import { CreateTaskPeriodDto } from '@backend/task-periods/dto/create-task-period.dto';
import { UserFromTokenDto } from 'users/dto/user-from-token.dto';
import { Status } from '@backend/task-appointments/task-appointments.enum';
import { InjectModel } from '@nestjs/sequelize';
import { Task } from './tasks.model';
import { TaskAppointmentsService } from '@backend/task-appointments/task-appointments.service';
import { TaskAppointment } from '@backend/task-appointments/task-appointments.model';
import { TaskPeriod } from '@backend/task-periods/task-periods.model';
import { DateTimeService } from '@backend/services/date-time.service';
import { Time } from '@backend/classes/Time';
import { IncludeService } from '@backend/services/include.service';
import { TaskPeriodsFilterService } from '@backend/filters/task-periods/task-periods.filter';
import { IProcessOptions, PeriodFilter } from '@backend/filters/process-options.interface';
import { TasksFilterService } from '@backend/filters/tasks/task.filter';
import { TaskLoggerService } from '@backend/services/task-logger.service';
import { UpdateTaskPeriodDto } from '@backend/task-periods/dto/update-task-period.dto';
import { ITask } from './tasks.interface';
import { CurrentUserService } from '@backend/services/current-user.service';

@Injectable()
export class TasksService {
    constructor(
        @InjectModel(Task) private taskRepository: typeof Task,
        private readonly taskPeriodsService: TaskPeriodsService,
        private readonly taskAppointmentsService: TaskAppointmentsService,
        private readonly dateTimeService: DateTimeService,
        private readonly includeService: IncludeService,
        private readonly periodsFilter: TaskPeriodsFilterService,
        private readonly tasksFilter: TasksFilterService,
        private readonly taskLoggerService: TaskLoggerService,
        private readonly currentUserService: CurrentUserService,
    ) { }

    public async createTask(
        createTaskDto: CreateTaskDto,
        userFromTokenDto: UserFromTokenDto,
    ): Promise<ITask> {
        createTaskDto = {
            ...createTaskDto,
            userId: userFromTokenDto.id,
        };

        const task = await this.taskRepository.create(createTaskDto);

        if (createTaskDto.previousTaskId) {
            this.taskRepository.update(
                {
                    nextTaskId: task.id,
                    nextTaskBreak: createTaskDto.previousTaskBreak,
                },
                {
                    where: { id: createTaskDto.previousTaskId },
                },
            );
        }

        if (
            Array.isArray(createTaskDto.periods)
            && createTaskDto.periods.length > 0
        ) {
            createTaskDto.periods
                .forEach((period: CreateTaskPeriodDto) => {
                    period.taskId = task.id;
                    this.taskPeriodsService.createTaskPeriod(period);
                });
        }

        return task;
    }

    public async deleteTask(id: number): Promise<number> {
        const task = await this.getTaskById(id);

        if (!task) {
            throw new HttpException('The task not found', HttpStatus.NOT_FOUND);
        }

        const affectedRows = await this.updateTask(id, {
            isDeleted: true,
        });

        return affectedRows;
    }

    public async getTaskById(id: number): Promise<Task> {
        const task = await this.taskRepository.findOne({
            include: [
                { all: true },
                this.includeService.getPeriodsWithAppointments(),
            ],
            where: { 
                id,
                isDeleted: false,
                userId: this.currentUserService.getCurrentUser()?.id,
            },
        });

        return task;
    }

    public async getTaskByAppointment(appointment: TaskAppointment): Promise<Task> {
        const task = await this.taskRepository.findOne({
            include: {
                model: TaskPeriod,
                ...this.includeService.getAppointmentsInclude2(),
                where: {
                    id: appointment.taskPeriodId,
                },
            },
            where: {
                userId: this.currentUserService.getCurrentUser()?.id,
            },
        });

        return task;
    }

    public async getTaskByPeriod(period: TaskPeriod): Promise<Task> {
        if (!period) {
            return null;
        }

        const task = await this.taskRepository.findOne({
            include: {
                model: TaskPeriod,
                ...this.includeService.getAppointmentsInclude2(),
                where: {
                    id: period.id,
                },
            },
            where: {
                userId: this.currentUserService.getCurrentUser()?.id,
            },
        });

        return task;
    }

    public async getAllTasks(): Promise<Task[]> {
        const tasks = await this.taskRepository.findAll({
            include: [
                { all: true },
                this.includeService.getPeriodsWithAppointments(),
            ],
            where: {
                isDeleted: false,
                userId: this.currentUserService.getCurrentUser()?.id,
            },
        });

        return tasks;
    }

    public async getCurrentTask(): Promise<Task> {
        const currentPeriod = await this.taskPeriodsService.getCurrentPeriod();

        return this.getTaskByPeriod(currentPeriod);
    }

    public async updateTask(id: number, updateTaskDto: UpdateTaskDto): Promise<number> {
        const task = await this.taskRepository.findOne({ where: { id } });
        const previousTask = await this.taskRepository.findOne({ where: { nextTaskId: id } });

        if (!task) {
            throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
        }

        const isPreviousTaskChanged = updateTaskDto.previousTaskId && previousTask?.id !== updateTaskDto.previousTaskId;
        const isPreviousTaskRemoved = previousTask && !updateTaskDto.previousTaskId;

        if (isPreviousTaskChanged) {
            this.taskRepository.update(
                {
                    nextTaskId: task.id,
                    nextTaskBreak: updateTaskDto.previousTaskBreak,
                },
                {
                    where: { id: updateTaskDto.previousTaskId },
                },
            );
        }

        if (isPreviousTaskRemoved || isPreviousTaskChanged) {
            this.taskRepository.update(
                {
                    nextTaskId: null,
                    nextTaskBreak: null,
                },
                {
                    where: { id: previousTask.id },
                },
            );
        }

        const [affectedRows] = await this.taskRepository.update(
            {
                text: updateTaskDto.text,
                duration: updateTaskDto.duration,
                categoryId: updateTaskDto.categoryId,
                nextTaskId: updateTaskDto.nextTaskId,
                nextTaskBreak: updateTaskDto.nextTaskBreak,
                isDeleted: updateTaskDto.isDeleted,
            },
            {
                where: { id },
            },
        );

        if (updateTaskDto.periods) {
            const currentTaskPeriods = await this.taskPeriodsService
                .getTaskPeriodsByTaskId(task.id);

            const newTaskPeriods = updateTaskDto.periods;

            const taskPeriodsToDelete = currentTaskPeriods.filter(
                (oldTaskPeriod) => !newTaskPeriods.some(
                    (newTaskPeriod) => newTaskPeriod.id === oldTaskPeriod.id,
                ),
            );

            if (taskPeriodsToDelete.length > 0) {
                taskPeriodsToDelete
                    .forEach((period: TaskPeriod) => {
                        this.taskPeriodsService.deleteTaskPeriod(period.id);
                    });
            }

            const taskPeriodsToCreate = newTaskPeriods.filter(
                (oldTaskPeriod) => !currentTaskPeriods.some(
                    (newTaskPeriod) => newTaskPeriod.id === oldTaskPeriod.id,
                ),
            );

            if (taskPeriodsToCreate.length > 0) {
                taskPeriodsToCreate
                    .forEach((period: UpdateTaskPeriodDto) => {
                        period.taskId = task.id;
                        // The ID was incremented on the frontend and may not be 
                        // reliable, so it is removed here.  
                        delete period.id;
                        this.taskPeriodsService.createTaskPeriod(period);
                    });
            }

            const taskPeriodsToUpdate = newTaskPeriods.filter(
                (oldTaskPeriod) => currentTaskPeriods.some(
                    (newTaskPeriod) => newTaskPeriod.id === oldTaskPeriod.id,
                ),
            );

            if (taskPeriodsToUpdate.length > 0) {
                taskPeriodsToUpdate
                    .forEach((period: UpdateTaskPeriodDto) => {
                        period.taskId = task.id;
                        this.taskPeriodsService.updateTaskPeriod(period);
                    });
            }
        }

        return affectedRows;
    }

    public async completeTask(taskId: number): Promise<number> {
        const task = await this.getTaskById(taskId);
        const appointedPeriod = this.taskPeriodsService.getAppointedPeriod(
            task.periods,
        );
        const affectedRows = await this.taskPeriodsService
            .setAppointmentCompleted(appointedPeriod);

        if (task.additionalTasks.length > 0) {
            // TODO: implement completion for additional tasks
        }

        return affectedRows;
    }

    // async rejectTask(appointedTaskDto: AppointedTaskDto): Promise<number> {
    //     const updateAppointmentQuery = `
    //         update ${DatabaseTable.TSK_APPOINTMENTS} 
    //         set statusId = ${Status.REJECTED}, endDate = now()
    //         where id = ${appointedTaskDto.appointmentId}
    //     `;

    //     const [updateResult] = await this.mysqlConnection.query(
    //         updateAppointmentQuery,
    //     );

    //     if (!CommonHelper.isEmptyArray(appointedTaskDto.additionalTasks)) {
    //         const rejectedAdditional = appointedTaskDto.additionalTasks.map(
    //             (task) => task.appointmentId,
    //         );

    //         const updateRejectedAdditionalAppointmentsQuery = `
    //             update ${DatabaseTable.TSK_APPOINTMENTS} 
    //             set statusId = ${Status.REJECTED}, endDate = now()
    //             where id in (${rejectedAdditional.join(',')})
    //         `;

    //         await this.mysqlConnection.query(
    //             updateRejectedAdditionalAppointmentsQuery,
    //         );
    //     }

    //     return updateResult.affectedRows;
    // }

    // async postponeTask(appointedTaskDto: AppointedTaskDto): Promise<number> {
    //     const updateAppointmentQuery = `
    //         update ${DatabaseTable.TSK_APPOINTMENTS} 
    //         set statusId = ${Status.POSTPONED}, startDate = DATE(startDate) + INTERVAL 1 DAY
    //         where id = ${appointedTaskDto.appointmentId}
    //     `;

    //     const [updateResult] = await this.mysqlConnection.query(
    //         updateAppointmentQuery,
    //     );

    //     console.log(CommonHelper.isEmptyArray(appointedTaskDto.additionalTasks));
    //     if (!CommonHelper.isEmptyArray(appointedTaskDto.additionalTasks)) {
    //         const rejectedAdditional = appointedTaskDto.additionalTasks.map(
    //             (task) => task.appointmentId,
    //         );

    //         const updateRejectedAdditionalAppointmentsQuery = `
    //             update ${DatabaseTable.TSK_APPOINTMENTS} 
    //             set statusId = ${Status.REJECTED}, endDate = now()
    //             where id in (${rejectedAdditional.join(',')})
    //         `;

    //         await this.mysqlConnection.query(
    //             updateRejectedAdditionalAppointmentsQuery,
    //         );
    //     }

    //     return updateResult.affectedRows;
    // }

    public async appointTask(): Promise<Task | null> {
        this.taskLoggerService.init();
        this.taskLoggerService.collect('Searching for task to appoint...');
        this.taskLoggerService.collect('Checking next task...');

        const nextTask = await this.appointNextTask();

        if (nextTask) {
            this.taskLoggerService.collect(`Next task "${nextTask.text}" (ID: ${nextTask.id}) successfully appointed!`);
            this.taskLoggerService.save();
            return nextTask;
        }

        this.taskLoggerService.collect('There\'s no next task.');
        this.taskLoggerService.collect('Checking time task...');

        const timeTask = await this.appointTimeTask();

        if (timeTask) {
            this.taskLoggerService.collect(`Time task "${timeTask.text}" (ID: ${timeTask.id}) successfully appointed!`);
            this.taskLoggerService.save();
            return timeTask;
        }

        this.taskLoggerService.collect('There\'s no time task.');
        this.taskLoggerService.collect('Checking dated task...');

        const datedTask = await this.appointDatedTask();

        if (datedTask) {
            this.taskLoggerService.collect(`Dated task "${datedTask.text}" (ID: ${datedTask.id}) successfully appointed!`);
            this.taskLoggerService.save();
            return datedTask;
        }

        this.taskLoggerService.collect('There\'s no dated task.');
        this.taskLoggerService.collect('Checking overdue task...');

        const overdueTask = await this.appointOverdueTask();

        if (overdueTask) {
            this.taskLoggerService.collect(`Overdue task "${overdueTask.text}" (ID: ${overdueTask.id}) successfully appointed!`);
            this.taskLoggerService.save();
            return overdueTask;
        }

        this.taskLoggerService.collect('There\'s no overdue task.');
        this.taskLoggerService.collect('Checking postponed task...');

        const postponedTask = await this.appointPostponedTask();

        if (postponedTask) {
            this.taskLoggerService.collect(`Postponed task "${postponedTask.text}" (ID: ${postponedTask.id}) successfully appointed!`);
            this.taskLoggerService.save();
            return postponedTask;
        }

        this.taskLoggerService.collect('There\'s no postponed task.');
        this.taskLoggerService.collect('Checking random task...');

        const randomTask = await this.appointRandomTask();

        if (randomTask) {
            this.taskLoggerService.collect(`Random task "${randomTask.text}" (ID: ${randomTask.id}) successfully appointed!`);
            this.taskLoggerService.save();
            return randomTask;
        }

        this.taskLoggerService.collect('There\'s no random task.');
        this.taskLoggerService.collect('There\'s no task for appointment!');
        this.taskLoggerService.save();

        return null;
    }

    public async appointNextTask(): Promise<Task> {
        this.taskLoggerService.collect('Searching for last appointment...');
        const lastAppointment = await this.taskAppointmentsService
            .getLastTaskAppointment();

        if (!lastAppointment) {
            this.taskLoggerService.collect('Last appointment not found.');
            return null;
        }

        this.taskLoggerService.collect(`Last appointment (ID: ${lastAppointment.id}) found.`);
        this.taskLoggerService.collect('Getting task by last appointment...');

        const lastTask = await this.getTaskByAppointment(lastAppointment);

        this.taskLoggerService.collect(`Last task "${lastTask.text}" (ID: ${lastTask.id}) found.`);
        this.taskLoggerService.collect('Getting next task for last task...');

        const [nextTask] = await this.getFilteredTaskChain(
            lastTask,
            this.getTaskChainAfterCurrentTask,
        );

        if (!nextTask) {
            this.taskLoggerService.collect('Next task not found.');
            return null;
        }

        if (lastTask.nextTaskBreak > 0) {
            await this.taskAppointmentsService.createTaskAppointment(
                nextTask,
                {
                    statusId: Status.POSTPONED,
                    timeBreak: lastTask.nextTaskBreak,
                },
            );

            /**
             * TODO: return something to let know, that postponed task was 
             * appointed
             */

            return null;
        }

        this.taskLoggerService.collect(`Next task "${nextTask.text}" (ID: ${nextTask.id}) found.`);
        this.taskLoggerService.collect('Looking for nearest time task...');

        const nearestTimeTask = await this.getNearestTimeTask();

        if (nearestTimeTask) {
            this.taskLoggerService.collect(`Nearest time task "${nearestTimeTask.text}" (ID: ${nearestTimeTask.id}) found.`);

            const isEnoughTime = this.hasTimeBeforeTimeTask(
                nextTask,
                nearestTimeTask,
            );

            // If it's enough time, appoint next task
            if (isEnoughTime) {
                await this.taskAppointmentsService.createTaskAppointment(
                    nextTask,
                );

                const additionalTasks = await this.appointAdditionalTasks(
                    nextTask,
                );

                if (additionalTasks?.length > 0) {
                    nextTask.additionalTasks = additionalTasks;
                }

                return nextTask;
            }

            // A time task and a next task are included in a same chain of tasks
            // TODO: check only after next task, not full chain
            const isCommonChain = await this.checkChainBelonging(
                nearestTimeTask,
                nextTask,
            );

            // If it's not enough time, appoint the time task from the chain
            if (isCommonChain) {
                await this.taskAppointmentsService.createTaskAppointment(
                    nearestTimeTask,
                );

                const additionalTasks = await this.appointAdditionalTasks(
                    nearestTimeTask,
                );

                if (additionalTasks?.length > 0) {
                    nearestTimeTask.additionalTasks = additionalTasks;
                }

                return nearestTimeTask;
            }

            return null;
        }

        this.taskLoggerService.collect('Nearest time task not found.');
        this.taskLoggerService.collect(`Appointing next task "${nextTask.text}" (ID: ${nextTask.id})...`);

        await this.taskAppointmentsService.createTaskAppointment(nextTask);

        const additionalTasks = await this.appointAdditionalTasks(
            nextTask,
        );

        if (additionalTasks?.length > 0) {
            nextTask.additionalTasks = additionalTasks;
        }

        return nextTask;
    }

    /**
     * Checks if there is sufficient time to complete the task before the 
     * specified time-bound task begins.
     */
    public hasTimeBeforeTimeTask(task: Task, timeTask: Task): boolean {
        const [timePeriod] = this.taskPeriodsService
            .processTaskPeriods(timeTask.periods, {
                periodFilters: [
                    this.periodsFilter.available,
                    this.periodsFilter.timeInterval,
                    this.periodsFilter.startTime,
                ],
                taskFilters: [
                    this.tasksFilter.actual,
                    this.tasksFilter.nonDeleted,
                    this.tasksFilter.active,
                ],
                sort: true,
            });

        // No need to worry about time if there's no period or startTime
        if (!timePeriod?.startTime) {
            return true;
        }

        /**
         * TODO: Consider skipping the time check for non-important tasks 
         * entirely. Currently, the offset is inverted for important tasks, but 
         * non-important tasks might not need a time-based check at all.
         */
        const timeTaskOffset = timePeriod.offset
            * (timePeriod.isImportant ? -1 : 1);

        const timeTaskStartTime = new Time(timePeriod.startTime)
            .addMinutes(timeTaskOffset);

        const taskEndTime = new Time(this.dateTimeService.getCurrentTime())
            .addMinutes(task.duration);

        const isEnoughTime = timeTaskStartTime >= taskEndTime;

        this.taskLoggerService.collect('Checking is there enough time until time task...');
        this.taskLoggerService.collect(`Time task will start at ${timeTaskStartTime} (offset: ${timeTaskOffset} minutes)`);
        this.taskLoggerService.collect(`Task "${task.text}" (ID: ${task.id}) will end at ${taskEndTime}`);

        return isEnoughTime;
    }

    /**
     * Retrieves the task that has the earliest associated period based on start 
     * time or underfined if there's no such task.
     */
    public async getNearestTimeTask(): Promise<Task | null> {
        const tasks = await this.getAllTasks();

        /**
         * TODO: Consider the case where the nearest time-bound task starts just
         * after midnight (e.g., 01:00:00). Since this task is on the next day, 
         * it may be filtered out unintentionally. If there are no time-bound 
         * tasks for today, make sure to check the next day as well.
         */
        const timeTasks = this.processTasks(tasks, {
            periodFilters: [
                this.periodsFilter.available,
                this.periodsFilter.timeInterval,
                this.periodsFilter.startTime,
                this.periodsFilter.cooldown,
                this.periodsFilter.free,
            ],
            taskFilters: [
                this.tasksFilter.actual,
                this.tasksFilter.nonDeleted,
                this.tasksFilter.active,
            ],
            sort: true,
        });
        const [nearestTimeTask] = timeTasks;

        return nearestTimeTask ?? null;
    }

    /**
     * Retrieves the task that has the earliest associated period based on start 
     * time.
     */
    private async getFirstTaskFromTimedChain(): Promise<Task | null> {
        const timeTask = await this.getNearestTimeTask();

        if (!timeTask) {
            return null;
        }

        const chain = await this.getFilteredTaskChain(
            timeTask,
            this.getTaskChainBeforeCurrentTask,
        );

        if (!chain.length) {
            return timeTask;
        }

        const totalDuration = chain.reduce(
            (duration, task) => duration + task.duration,
            0,
        );

        const [firstAvailableChainTask] = chain;

        /**
         * Inheritance of properties of the time task to the first task from
         * chain. After it's considering that first task from chain is time
         * task now.
         */
        firstAvailableChainTask.periods[0].isImportant = timeTask.periods[0].isImportant;
        firstAvailableChainTask.periods[0].startTime = (
            /**
             * TODO: incapsulate Time creation into service like chainableDate
             */
            new Time(timeTask.periods[0].startTime)
                .addMinutes(-totalDuration)
                .toString()
        );

        return firstAvailableChainTask;
    }

    public processTasks(tasks: Task[], options: IProcessOptions): Task[] {
        tasks = this.filterTasks(tasks, options);

        /**
         * Processing of tasks and periods share same options, so if it's need
         * to sort tasks, periods have been sorted already.
         */
        if (options.sort) {
            tasks = this.sortTasks(tasks);
        }

        return tasks;
    }

    /**
     * Filters using the specified filters.
     */
    private filterTasks(tasks: Task[], options: IProcessOptions): Task[] {
        return tasks
            .map((task) => this.filterPeriods(task, options))
            .filter((task) => task.periods.length);
    }

    private filterPeriods(task: Task, options: IProcessOptions): Task {
        task.periods = this.taskPeriodsService.processTaskPeriods(
            task.periods,
            options,
        )

        return task;
    }

    /**
     * Sorts tasks by ascending start time of the earliest period.
     */
    private sortTasks(tasks: Task[]): Task[] {
        return tasks.sort(
            (taskA, taskB) =>
                /**
                 * It's suposed that periods are sorted by start time ascending, 
                 * so comparing the start time of the first period.
                 */
                taskA.periods[0].startTime < taskB.periods[0].startTime ? -1 : 1,
        );
    }

    public async appointAdditionalTasks(task: Task): Promise<Task[]> {
        const regularAdditionalTasks = await this.appointRegularAdditionalTasks(task);
        const postponedAdditionalTasks = await this.appointPostponedAdditionalTasks(task);

        return [
            ...regularAdditionalTasks,
            ...postponedAdditionalTasks,
        ];
    }

    private async appointRegularAdditionalTasks(task: Task): Promise<Task[]> {
        const additionalTasks = await this.getRegularAdditionalTasks(task);

        if (!additionalTasks?.length) {
            return [];
        }

        additionalTasks.forEach(async (additionalTask) => {
            await this.taskAppointmentsService.createTaskAppointment(
                additionalTask,
            );
        });

        return additionalTasks;
    }

    private async appointPostponedAdditionalTasks(task: Task): Promise<Task[]> {
        const additionalTasks = await this.getPostponedAdditionalTasks(task);

        if (!additionalTasks?.length) {
            return [];
        }

        additionalTasks.forEach(async (additionalTask) => {
            const [appointment] = additionalTask.periods
                .flatMap((period) => period.appointments)
                .filter((appointment) => appointment.statusId == Status.POSTPONED);

            await this.taskAppointmentsService.updateTaskAppointment(
                appointment.id,
                {
                    statusId: Status.APPOINTED,
                    startDate: this.dateTimeService.getCurrentDateTime(),
                },
            );
        });

        return additionalTasks;
    }

    private async appointDatedTask(): Promise<Task> {
        const tasks = await this.getAllTasks();

        /**
         * TODO: check time until nearest time task. Make it with new type of
         * filters. Also need to make sure that task is not part of the chain.
         * To do this need to get nearest task and pass it as parameter.
         */
        const [datedTask] = this.filterTasks(tasks, {
            periodFilters: [
                this.periodsFilter.available,
                this.periodsFilter.noStartTime,
                this.periodsFilter.cooldown,
                this.periodsFilter.free,
                this.periodsFilter.dated,
            ],
            taskFilters: [
                this.tasksFilter.actual,
                this.tasksFilter.nonDeleted,
                this.tasksFilter.active,
            ],
            sort: false,
        });

        if (!datedTask) {
            return null;
        }

        await this.taskAppointmentsService.createTaskAppointment(datedTask);

        const additionalTasks = await this.appointAdditionalTasks(datedTask);

        if (additionalTasks?.length > 0) {
            datedTask.additionalTasks = additionalTasks;
        }

        return datedTask;
    }

    private async appointOverdueTask(): Promise<Task> {
        const tasks = await this.getAllTasks();

        /**
         * TODO: add filter for nearest time task
         */
        const [overdueTask] = this.filterTasks(tasks, {
            periodFilters: [
                this.periodsFilter.cooldown,
                this.periodsFilter.free,
                this.periodsFilter.dated,
                this.periodsFilter.overdue,
            ],
            taskFilters: [
                this.tasksFilter.actual,
                this.tasksFilter.nonDeleted,
                this.tasksFilter.active,
            ],
            sort: false,
        });

        if (!overdueTask) {
            return null;
        }

        await this.taskAppointmentsService.createTaskAppointment(overdueTask);

        const additionalTasks = await this.appointAdditionalTasks(overdueTask);

        if (additionalTasks?.length > 0) {
            overdueTask.additionalTasks = additionalTasks;
        }

        return overdueTask;
    }

    private async appointPostponedTask(): Promise<Task> {
        const tasks = await this.getAllTasks();

        /**
         * TODO: add filter for nearest time task
         */
        const [postponedTask] = this.filterTasks(tasks, {
            periodFilters: [
                this.periodsFilter.available,
                this.periodsFilter.cooldown,
                this.periodsFilter.free,
                this.periodsFilter.postponed,
            ],
            taskFilters: [
                this.tasksFilter.actual,
                this.tasksFilter.nonDeleted,
                this.tasksFilter.active,
            ],
            sort: false,
        });

        if (!postponedTask) {
            return null;
        }

        await this.taskAppointmentsService.createTaskAppointment(postponedTask);

        const additionalTasks = await this.appointAdditionalTasks(postponedTask);

        if (additionalTasks?.length > 0) {
            postponedTask.additionalTasks = additionalTasks;
        }

        return postponedTask;
    }

    private async appointRandomTask(): Promise<Task> {
        const tasks = await this.getAllTasks();

        /**
         * TODO: add filter for nearest time task
         */
        const randomTasks = this.filterTasks(tasks, {
            periodFilters: [
                this.periodsFilter.available,
                this.periodsFilter.cooldown,
                this.periodsFilter.free,
                this.periodsFilter.noStartTime,
            ],
            taskFilters: [
                this.tasksFilter.actual,
                this.tasksFilter.nonDeleted,
                this.tasksFilter.active,
            ],
            sort: false,
        });

        if (randomTasks.length === 0) {
            return null;
        }

        const randomTask = randomTasks[Math.floor(Math.random() * randomTasks.length)];

        await this.taskAppointmentsService.createTaskAppointment(randomTask);

        const additionalTasks = await this.appointAdditionalTasks(randomTask);

        if (additionalTasks?.length > 0) {
            randomTask.additionalTasks = additionalTasks;
        }

        return randomTask;
    }

    /**
     * Retrieves a chain of filtered tasks. If no tasks are available, returns 
     * empty array.
     */
    public async getFilteredTaskChain(
        task: Task,
        getChainFunction: (task: Task) => Promise<Task[]>,
    ): Promise<Task[]> {
        this.taskLoggerService.collect(`Getting task chain for "${task.text}" (ID: ${task.id})...`);

        const chain: Task[] = await getChainFunction.call(this, task);

        if (!chain.length) {
            this.taskLoggerService.collect('Chain not found.');
            return [];
        }

        const chainTaskTexts = chain.map((task) => task.text).join('", "');
        this.taskLoggerService.collect(`Chain found. It contains tasks: "${chainTaskTexts}"`);
        this.taskLoggerService.collect('Filtering chain of tasks...');

        const filteredChain = this.processTasks(chain, {
            periodFilters: [
                this.periodsFilter.available,
                this.periodsFilter.free,
            ],
            taskFilters: [
                this.tasksFilter.actual,
                this.tasksFilter.nonDeleted,
                this.tasksFilter.active,
            ],
            sort: false,
        });

        if (!filteredChain.length) {
            this.taskLoggerService.collect('After filtering there\'s no tasks left.');
            return [];
        }

        const filterdChainTaskTexts = chain.map((task) => task.text).join('", "');
        this.taskLoggerService.collect(`After filtering chain contains tasks: "${filterdChainTaskTexts}"`);

        return filteredChain;
    }

    /**
     * Retrieves the entire task chain that contains the task with the given 
     * task ID. The provided task can be at any position within the chain 
     * (start, middle, or end). If the task is not part of any chain, returns 
     * array with only original task.
     */
    private async getFullTaskChain(task: Task): Promise<Task[]> {
        const firstPart = await this.getTaskChainBeforeCurrentTask(task);
        const secondPart = await this.getTaskChainAfterCurrentTask(task);

        return [...firstPart, task, ...secondPart];
    }

    /**
     * Retrieves the task chain starting from the task with the given task ID.
     * If the task is not part of any chain, returns empty array.
     */
    public async getTaskChainAfterCurrentTask(task: Task): Promise<Task[]> {
        const chain: Task[] = [];
        let currentTask = task;

        console.log(`current task id is ${currentTask?.id}`)

        while (currentTask.nextTaskId) {
            currentTask = await Task.findOne({
                include: [
                    { all: true },
                    this.includeService.getPeriodsWithAppointments(),
                ],
                where: { id: currentTask.nextTaskId },
            });
            chain.push(currentTask);
        }

        return chain;
    }

    /**
     * Retrieves the task chain starting from the first task in the chain and
     * ending before the task with the given task ID.
     * If the task is not part of any chain, returns empty array.
     */
    private async getTaskChainBeforeCurrentTask(task: Task): Promise<Task[]> {
        const chain: Task[] = [];
        let currentTask = task;

        while (currentTask) {
            chain.unshift(currentTask);
            currentTask = await Task.findOne({
                include: [
                    { all: true },
                    this.includeService.getPeriodsWithAppointments(),
                ],
                where: { nextTaskId: currentTask.id },
            });
        }

        chain.pop();

        return chain;
    }

    public async checkChainBelonging(taskA: Task, taskB: Task): Promise<boolean> {
        const taskChainId = (await this.getFullTaskChain(taskA)).map(
            (task) => task.id,
        );

        return taskChainId.includes(taskB.id);
    }

    private async getRegularAdditionalTasks(task: Task): Promise<Task[]> {
        return this.getAdditionalTasks(task, this.periodsFilter.cooldown);
    }

    private async getPostponedAdditionalTasks(task: Task): Promise<Task[]> {
        return this.getAdditionalTasks(task, this.periodsFilter.postponed);
    }

    private async getAdditionalTasks(
        task: Task,
        additionalFilter: PeriodFilter,
    ): Promise<Task[]> {
        // const additionalTasks = await this.taskRelationsService
        //     .getAllAdditionalTasks(task);

        console.log(task);

        const additionalTasks = task.additionalTasks;

        const processedAdditionalTasks = this.processTasks(additionalTasks, {
            periodFilters: [
                this.periodsFilter.available,
                this.periodsFilter.free,
                this.periodsFilter.noStartTime,
                additionalFilter,
            ],
            taskFilters: [
                this.tasksFilter.actual,
                this.tasksFilter.nonDeleted,
                this.tasksFilter.active,
            ],
            sort: false,
        });

        return processedAdditionalTasks;
    }

    private async appointTimeTask(): Promise<Task | null> {
        const timeTask = await this.getFirstTaskFromTimedChain();

        if (!timeTask) {
            return null;
        }

        await this.taskAppointmentsService.createTaskAppointment(timeTask);

        const additionalTasks = await this.appointAdditionalTasks(timeTask);

        if (additionalTasks?.length > 0) {
            timeTask.additionalTasks = additionalTasks;
        }

        return timeTask;
    }
}
