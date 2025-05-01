import { Test, TestingModule } from '@nestjs/testing';
import { DateTimeService } from '@backend/services/date-time.service';
import { TasksFilterService } from './task.filter';
import { Task } from '@backend/tasks/tasks.model';
import { CurrentUserService } from '@backend/services/current-user.service';

describe('TasksFilterService', () => {
    let dateTimeService: DateTimeService;
    let tasksFilterService: TasksFilterService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TasksFilterService,
                CurrentUserService,
                {
                    provide: DateTimeService,
                    useValue: {
                        getUserCurrentDate: jest.fn(),
                    },
                },
            ],
        }).compile();

        dateTimeService = module.get<DateTimeService>(DateTimeService);
        tasksFilterService = module.get<TasksFilterService>(TasksFilterService);
    });

    describe('actual', () => {
        it('should return true, because the task is actual', async () => {
            const task = { startDate: '2024-10-31', endDate: '2024-10-31' } as Task;

            jest.spyOn(dateTimeService, 'getUserCurrentDate')
                .mockReturnValue('2024-10-31');

            const result = tasksFilterService.actual(task);

            expect(result).toEqual(true);
        });
    });

    
});