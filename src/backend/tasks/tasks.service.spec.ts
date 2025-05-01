import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { Task } from './tasks.model';
import { getModelToken } from '@nestjs/sequelize';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskPeriodsService } from '@backend/task-periods/task-periods.service';
import { TaskAppointmentsService } from '@backend/task-appointments/task-appointments.service';
import { DateTimeService } from '@backend/services/date-time.service';
import { TaskRelationsService } from '@backend/task-relations/task-relations.service';
import { IncludeService } from '@backend/services/include.service';
import { TaskPeriod } from '@backend/task-periods/task-periods.model';
import { TaskPeriodsFilterService } from '@backend/filters/task-periods/task-periods.filter';
import { TaskAppointment } from '@backend/task-appointments/task-appointments.model';
import { TasksFilterService } from '@backend/filters/tasks/task.filter';
import { TaskLoggerService } from '@backend/services/task-logger.service';
import { CurrentUserService } from '@backend/services/current-user.service';
import { User } from '@backend/users/users.model';

describe('TaskService', () => {
    let tasksService: TasksService;
    let dateTimeService: DateTimeService;
    let taskAppointmentsService: TaskAppointmentsService;
    let taskPeriodsService: TaskPeriodsService;
    let currentUserService: CurrentUserService;
    let tasksRepository: typeof Task;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TasksService,
                {
                    provide: TaskRelationsService,
                    useValue: {
                        //getAllAdditionalTasks: jest.fn(),
                    },
                },
                {
                    provide: IncludeService,
                    useValue: {
                    },
                },
                {
                    provide: getModelToken(Task),
                    useValue: {
                        create: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: TaskPeriodsService,
                    useValue: {
                        processTaskPeriods: jest.fn(),
                    },
                },
                {
                    provide: TaskAppointmentsService,
                    useValue: {
                        createTaskAppointment: jest.fn(),
                        getLastTaskAppointment: jest.fn(),
                    },
                },
                {
                    provide: DateTimeService,
                    useValue: {
                        getCurrentTime: jest.fn(),
                        getUserCurrentDate: jest.fn(),
                        getCurrentDateTime: jest.fn(),
                        getUserCurrentMonth: jest.fn(),
                        getUserCurrentDay: jest.fn(),
                        getUserCurrentWeekday: jest.fn(),
                        checkTimeInterval: jest.fn(),
                    },
                },
                {
                    provide: TaskPeriodsFilterService,
                    useValue: {
                        available: jest.fn(),
                        free: jest.fn(),
                        timeInterval: jest.fn(),
                        startTime: jest.fn(),
                        noStartTime: jest.fn(),
                        cooldown: jest.fn(),
                    },
                },
                {
                    provide: TasksFilterService,
                    useValue: {
                        actual: jest.fn(),
                        nonDeleted: jest.fn(),
                        active: jest.fn(),
                    },
                },
                TaskLoggerService,
                CurrentUserService,
            ],
        }).compile();

        dateTimeService = module.get<DateTimeService>(DateTimeService);
        tasksService = module.get<TasksService>(TasksService);
        taskPeriodsService = module.get<TaskPeriodsService>(TaskPeriodsService);
        taskAppointmentsService = module.get<TaskAppointmentsService>(TaskAppointmentsService);
        currentUserService = module.get<CurrentUserService>(CurrentUserService);
        tasksRepository = module.get<typeof Task>(getModelToken(Task));
    });

    describe('createTask', () => {
        it('should return task after creation', async () => {
            const mockTask: Task = { id: 1, text: 'Test Task 1', duration: 1 } as Task;

            (tasksRepository.create as jest.Mock).mockResolvedValue(mockTask);

            jest.spyOn(currentUserService, 'getCurrentUser')
                .mockReturnValue({ id: 1 } as User);

            const task = await tasksService.createTask(
                {} as CreateTaskDto,
            );

            expect(task).toEqual(mockTask);
        });
    });

    describe('deleteTask', () => {
        it('should return affected rows', async () => {
            const mockAffectedRows = 1;

            jest.spyOn(tasksService, 'updateTask')
                .mockReturnValue(Promise.resolve(1));

            jest.spyOn(tasksService, 'getTaskById')
                .mockReturnValue(Promise.resolve({ id: 1 } as Task));

            const affectedRows = await tasksService.deleteTask(1);

            expect(affectedRows).toEqual(mockAffectedRows);
        });
    });

    describe('getFilteredTaskChain', () => {
        it('should return task with id 2, because it is first passed the filter', async () => {
            const lastTask = { id: 1 } as Task;
            const nextTask = { id: 2 } as Task;

            jest.spyOn(tasksService, 'getTaskChainAfterCurrentTask')
                .mockReturnValue(Promise.resolve([]));

            jest.spyOn(tasksService, 'processTasks')
                .mockReturnValue([nextTask]);

            const result = await tasksService.getFilteredTaskChain(
                lastTask,
                async () => [lastTask, nextTask],
            );

            expect(result).toEqual([nextTask]);
        });

        it('should return empty array, because no task passed the filters', async () => {
            const lastTask = { id: 1 } as Task;

            jest.spyOn(tasksService, 'getTaskChainAfterCurrentTask')
                .mockReturnValue(Promise.resolve([]));

            jest.spyOn(tasksService, 'processTasks')
                .mockReturnValue([]);

            const result = await tasksService.getFilteredTaskChain(
                lastTask,
                async () => [],
            );

            expect(result).toEqual([]);
        });
    });

    describe('appointNextTask', () => {
        it('should return null, because there\'s no next task', async () => {
            const lastTask = { id: 1 } as Task;

            jest.spyOn(tasksService, 'getFilteredTaskChain')
                .mockReturnValue(Promise.resolve([]));

            jest.spyOn(tasksService, 'appointAdditionalTasks')
                .mockReturnValue(Promise.resolve([]));

            jest.spyOn(taskAppointmentsService, 'getLastTaskAppointment')
                .mockReturnValue(Promise.resolve({} as TaskAppointment));

            jest.spyOn(tasksService, 'getTaskByAppointment')
                .mockReturnValue(Promise.resolve(lastTask));

            const appointedTask = await tasksService.appointNextTask();

            expect(appointedTask).toEqual(null);
        });

        it('should return null, because there\'s a time break', async () => {
            const tasks = [
                {
                    id: 1,
                    nextTaskId: 2,
                    nextTaskBreak: 1,
                } as Task,
                { id: 2 } as Task,
            ];
            const lastTask = tasks[0];
            const nextTask = tasks[1];

            jest.spyOn(tasksService, 'getFilteredTaskChain')
                .mockReturnValue(Promise.resolve([nextTask]));

            jest.spyOn(taskAppointmentsService, 'createTaskAppointment')
                .mockReturnValue(Promise.resolve(null));

            jest.spyOn(taskAppointmentsService, 'getLastTaskAppointment')
                .mockReturnValue(Promise.resolve({} as TaskAppointment));

            jest.spyOn(tasksService, 'getTaskByAppointment')
                .mockReturnValue(Promise.resolve(lastTask));

            const appointedTask = await tasksService.appointNextTask();

            expect(appointedTask).toEqual(null);
        });

        it('should return next task, because there\'s no time task', async () => {
            const tasks = [
                { id: 1, nextTaskId: 2 } as Task,
                { id: 2 } as Task,
            ];
            const lastTask = tasks[0];
            const nextTask = tasks[1];

            jest.spyOn(tasksService, 'getFilteredTaskChain')
                .mockReturnValue(Promise.resolve([nextTask]));

            jest.spyOn(tasksService, 'getNearestTimeTask')
                .mockReturnValue(Promise.resolve(null));

            jest.spyOn(taskAppointmentsService, 'getLastTaskAppointment')
                .mockReturnValue(Promise.resolve({} as TaskAppointment));

            jest.spyOn(tasksService, 'getTaskByAppointment')
                .mockReturnValue(Promise.resolve(lastTask));

            jest.spyOn(tasksService, 'appointAdditionalTasks')
                .mockReturnValue(Promise.resolve([]));

            const appointedTask = await tasksService.appointNextTask();

            expect(appointedTask).toEqual(nextTask);
        });

        it('should return next task, because there\'s enough time', async () => {
            const tasks = [
                { id: 1, nextTaskId: 2 } as Task,
                { id: 2 } as Task,
                { id: 3 } as Task,
            ];
            const [lastTask, nextTask, timeTask] = tasks;

            jest.spyOn(tasksService, 'getFilteredTaskChain')
                .mockReturnValue(Promise.resolve([nextTask]));

            jest.spyOn(tasksService, 'getNearestTimeTask')
                .mockReturnValue(Promise.resolve(timeTask));

            jest.spyOn(tasksService, 'hasTimeBeforeTimeTask')
                .mockReturnValue(true);

            jest.spyOn(tasksService, 'appointAdditionalTasks')
                .mockReturnValue(Promise.resolve([]));

            jest.spyOn(taskAppointmentsService, 'createTaskAppointment')
                .mockReturnValue(Promise.resolve(null));

            jest.spyOn(taskAppointmentsService, 'getLastTaskAppointment')
                .mockReturnValue(Promise.resolve({} as TaskAppointment));

            jest.spyOn(tasksService, 'getTaskByAppointment')
                .mockReturnValue(Promise.resolve(lastTask));

            const appointedTask = await tasksService.appointNextTask();

            expect(appointedTask).toEqual(nextTask);
        });

        it('should return null, because there\'s not enough time', async () => {
            const tasks = [
                { id: 1, nextTaskId: 2 } as Task,
                { id: 2 } as Task,
                { id: 3 } as Task,
            ];
            const [lastTask, nextTask, timeTask] = tasks;

            jest.spyOn(tasksService, 'getFilteredTaskChain')
                .mockReturnValue(Promise.resolve([nextTask]));

            jest.spyOn(tasksService, 'getNearestTimeTask')
                .mockReturnValue(Promise.resolve(timeTask));

            jest.spyOn(tasksService, 'hasTimeBeforeTimeTask')
                .mockReturnValue(false);

            jest.spyOn(taskAppointmentsService, 'createTaskAppointment')
                .mockReturnValue(Promise.resolve(null));

            jest.spyOn(tasksService, 'checkChainBelonging')
                .mockReturnValue(Promise.resolve(false));

            jest.spyOn(taskAppointmentsService, 'getLastTaskAppointment')
                .mockReturnValue(Promise.resolve({} as TaskAppointment));

            jest.spyOn(tasksService, 'getTaskByAppointment')
                .mockReturnValue(Promise.resolve(lastTask));

            const appointedTask = await tasksService.appointNextTask();

            expect(appointedTask).toEqual(null);
        });

        it('should return time task, because it is in the same chain as next task', async () => {
            const tasks = [
                { id: 1, nextTaskId: 2 } as Task,
                { id: 2, nextTaskId: 3, duration: 2 } as Task,
                {
                    id: 3,
                    additionalTasks: [],
                    periods: [{ startTime: '12:00:00', offset: 0 }],
                } as Task,
            ];
            const [lastTask, nextTask, timeTask] = tasks;

            jest.spyOn(tasksService, 'getFilteredTaskChain')
                .mockReturnValue(Promise.resolve([nextTask]));

            jest.spyOn(tasksService, 'getNearestTimeTask')
                .mockReturnValue(Promise.resolve(timeTask));

            jest.spyOn(tasksService, 'hasTimeBeforeTimeTask')
                .mockReturnValue(false);

            jest.spyOn(tasksService, 'checkChainBelonging')
                .mockReturnValue(Promise.resolve(true));

            jest.spyOn(taskAppointmentsService, 'createTaskAppointment')
                .mockReturnValue(Promise.resolve(null));

            // jest.spyOn(currentUserService, 'getCurrentUser')
            //     .mockReturnValue({} as User);

            jest.spyOn(taskAppointmentsService, 'getLastTaskAppointment')
                .mockReturnValue(Promise.resolve({} as TaskAppointment));

            jest.spyOn(tasksService, 'getTaskByAppointment')
                .mockReturnValue(Promise.resolve(lastTask));

            const appointedTask = await tasksService.appointNextTask();

            expect(appointedTask).toEqual(timeTask);
        });
    });

    describe('hasTimeBeforeTimeTask', () => {
        it('should return true, because it\'s enough time', async () => {
            const tasks = [
                { id: 1, duration: 1 } as Task,
                {
                    id: 2,
                    periods: [{
                        startTime: '12:00:00',
                        offset: 0,
                        isImportant: false,
                    }],
                } as Task,
            ];
            const task = tasks[0];
            const timeTask = tasks[1];

            jest.spyOn(dateTimeService, 'getCurrentTime')
                .mockReturnValue('11:59');

            jest.spyOn(taskPeriodsService, 'processTaskPeriods')
                .mockReturnValue([{
                    startTime: '12:00:00',
                    offset: 0,
                    isImportant: false,
                } as TaskPeriod]);

            const appointedTask = tasksService.hasTimeBeforeTimeTask(
                task,
                timeTask,
            );

            expect(appointedTask).toEqual(true);
        });

        it('should return true, because there\'s non-important time with offset', async () => {
            const tasks = [
                { id: 1, duration: 1 } as Task,
                {
                    id: 2,
                    periods: [{
                        startTime: '12:00:00',
                        offset: 1,
                        isImportant: false,
                    }],
                } as Task,
            ];
            const task = tasks[0];
            const timeTask = tasks[1];

            jest.spyOn(dateTimeService, 'getCurrentTime')
                .mockReturnValue('12:00:00');

            jest.spyOn(taskPeriodsService, 'processTaskPeriods')
                .mockReturnValue([{
                    startTime: '12:00:00',
                    offset: 1,
                    isImportant: false,
                } as TaskPeriod]);

            const appointedTask = tasksService.hasTimeBeforeTimeTask(
                task,
                timeTask,
            );

            expect(appointedTask).toEqual(true);
        });

        it('should return false, because it\'s not enough time', async () => {
            const tasks = [
                { id: 1, duration: 1 } as Task,
                {
                    id: 2,
                    periods: [{
                        startTime: '12:00:00',
                        offset: 0,
                        isImportant: false,
                    }],
                } as Task,
            ];
            const task = tasks[0];
            const timeTask = tasks[1];

            jest.spyOn(dateTimeService, 'getCurrentTime')
                .mockReturnValue('12:00:00');

            jest.spyOn(taskPeriodsService, 'processTaskPeriods')
                .mockReturnValue([{ startTime: '12:00:00' } as TaskPeriod]);

            const appointedTask = tasksService.hasTimeBeforeTimeTask(
                task,
                timeTask,
            );

            expect(appointedTask).toEqual(false);
        });

        it('should return false, because there\'s important time with offset', async () => {
            const tasks = [
                { id: 1, duration: 1 } as Task,
                {
                    id: 2,
                    periods: [{
                        startTime: '12:00:00',
                        offset: 1,
                        isImportant: true,
                    }],
                } as Task,
            ];
            const task = tasks[0];
            const timeTask = tasks[1];

            jest.spyOn(dateTimeService, 'getCurrentTime')
                .mockReturnValue('11:59');

            jest.spyOn(taskPeriodsService, 'processTaskPeriods')
                .mockReturnValue([{ startTime: '12:00:00' } as TaskPeriod]);

            const appointedTask = tasksService.hasTimeBeforeTimeTask(
                task,
                timeTask,
            );

            expect(appointedTask).toEqual(false);
        });
    });
});