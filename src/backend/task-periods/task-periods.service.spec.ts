import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { TaskPeriodsService } from '@backend/task-periods/task-periods.service';
import { DateTimeService } from '@backend/services/date-time.service';
import { TaskPeriod } from './task-periods.model';
import { TaskPeriodsFilterService } from '../filters/task-periods/task-periods.filter';
import { TaskAppointmentsService } from '@backend/task-appointments/task-appointments.service';
import { IncludeService } from '@backend/services/include.service';

describe('TaskPeriodsService', () => {
    let taskPeriodsService: TaskPeriodsService
    let taskPeriodsRepository: typeof TaskPeriod;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TaskPeriodsService,
                TaskPeriodsFilterService,
                IncludeService,
                DateTimeService,
                {
                    provide: getModelToken(TaskPeriod),
                    useValue: {
                        create: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: TaskAppointmentsService,
                    useValue: {
                    },
                },
            ],
        }).compile();

        taskPeriodsService = module.get<TaskPeriodsService>(TaskPeriodsService);
        taskPeriodsRepository = module.get<typeof TaskPeriod>(getModelToken(TaskPeriod));
    });

    describe('sortPeriods', () => {
        it('should return array of periods sorted by start time', async () => {
            const periods = [
                { startTime: '12:00:00' } as TaskPeriod,
                { startTime: '11:00:00' } as TaskPeriod,
                { startTime: '18:00:00' } as TaskPeriod,
                { startTime: '09:00:00' } as TaskPeriod,
                { startTime: '07:00:00' } as TaskPeriod,
                { startTime: '07:30:00' } as TaskPeriod,
                { startTime: '16:30:00' } as TaskPeriod,
                { startTime: '20:30:01' } as TaskPeriod,
                { startTime: '20:30:00' } as TaskPeriod,
            ];

            const sortedPeriods = [
                { startTime: '07:00:00' } as TaskPeriod,
                { startTime: '07:30:00' } as TaskPeriod,
                { startTime: '09:00:00' } as TaskPeriod,
                { startTime: '11:00:00' } as TaskPeriod,
                { startTime: '12:00:00' } as TaskPeriod,
                { startTime: '16:30:00' } as TaskPeriod,
                { startTime: '18:00:00' } as TaskPeriod,
                { startTime: '20:30:00' } as TaskPeriod,
                { startTime: '20:30:01' } as TaskPeriod,
            ];

            const result = taskPeriodsService.sortPeriods(periods);

            expect(result).toEqual(sortedPeriods);
        });
    });

    describe('filterPeriods', () => {
        it('should return array of periods sorted by start time', async () => {
            const periods = [
                { id: 1 } as TaskPeriod,
                { id: 2 } as TaskPeriod,
                { id: 3 } as TaskPeriod,
                { id: 4 } as TaskPeriod,
                { id: 5 } as TaskPeriod,
                { id: 6 } as TaskPeriod,
                { id: 7 } as TaskPeriod,
                { id: 8 } as TaskPeriod,
                { id: 9 } as TaskPeriod,
            ];

            const filteredPeriods = [
                { id: 2 } as TaskPeriod,
                { id: 8 } as TaskPeriod,
            ];

            const filters = [
                (period: TaskPeriod) => period.id % 2 === 0, 
                [
                    (period: TaskPeriod) => period.id <= 3, 
                    (period: TaskPeriod) => period.id >= 7,
                ]
            ];

            const result = taskPeriodsService.filterPeriods(periods, filters);

            expect(result).toEqual(filteredPeriods);
        });
    });
});