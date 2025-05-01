import { Test, TestingModule } from '@nestjs/testing';
import { DateTimeService } from '@backend/services/date-time.service';
import { TaskPeriod } from '@backend/task-periods/task-periods.model';
import { TaskAppointment } from '@backend/task-appointments/task-appointments.model';
import { Status } from '@backend/task-appointments/task-appointments.enum';
import { TaskPeriodsFilterService } from './task-periods.filter';

describe('TaskPeriodsFilterService', () => {
    let dateTimeService: DateTimeService;
    let taskPeriodsFilterService: TaskPeriodsFilterService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TaskPeriodsFilterService,
                {
                    provide: DateTimeService,
                    useValue: {
                        getUserCurrentDate: jest.fn(),
                        getUserCurrentMonth: jest.fn(),
                        getUserCurrentDay: jest.fn(),
                        getUserCurrentWeekday: jest.fn(),
                        getCurrentDateTime: jest.fn(),
                        checkTimeInterval: jest.fn(),
                        getTimeFunctionDuePeriodType: jest.fn(),
                    },
                },
            ],
        }).compile();

        dateTimeService = module.get<DateTimeService>(DateTimeService);
        taskPeriodsFilterService = module.get<TaskPeriodsFilterService>(TaskPeriodsFilterService);
    });

    describe('available', () => {
        it('should return true, because the period is available for current date', async () => {
            const period = { date: '2024-10-31' } as TaskPeriod;

            jest.spyOn(dateTimeService, 'getUserCurrentDate')
                .mockReturnValue('2024-10-31');

            const result = taskPeriodsFilterService.available(period);

            expect(result).toEqual(true);
        });

        it('should return false, because the period is not available for current date', async () => {
            const period = { date: '2024-10-30' } as TaskPeriod;

            jest.spyOn(dateTimeService, 'getUserCurrentDate')
                .mockReturnValue('2024-10-31');

            const result = taskPeriodsFilterService.available(period);

            expect(result).toEqual(false);
        });

        it('should return true, because the period is available for current month and day', async () => {
            const period = { month: 10, day: 30 } as TaskPeriod;

            jest.spyOn(dateTimeService, 'getUserCurrentMonth')
                .mockReturnValue(10);

            jest.spyOn(dateTimeService, 'getUserCurrentDay')
                .mockReturnValue(30);

            const result = taskPeriodsFilterService.available(period);

            expect(result).toEqual(true);
        });

        it('should return false, because the period is not available for current month and day', async () => {
            const period = { month: 10, day: 30 } as TaskPeriod;

            jest.spyOn(dateTimeService, 'getUserCurrentMonth')
                .mockReturnValue(10);

            jest.spyOn(dateTimeService, 'getUserCurrentDay')
                .mockReturnValue(31);

            const result = taskPeriodsFilterService
                .available(period);

            expect(result).toEqual(false);
        });

        it('should return true, because the period is available for current weekday', async () => {
            const period = { weekday: 3 } as TaskPeriod;

            jest.spyOn(dateTimeService, 'getUserCurrentWeekday')
                .mockReturnValue(3);

            jest.spyOn(dateTimeService, 'checkTimeInterval')
                .mockReturnValue(true);

            const result = taskPeriodsFilterService
                .available(period);

            expect(result).toEqual(true);
        });

        it('should return false, because the period is not available for current weekday', async () => {
            const period = { weekday: 3 } as TaskPeriod;

            jest.spyOn(dateTimeService, 'getUserCurrentWeekday')
                .mockReturnValue(4);

            jest.spyOn(dateTimeService, 'checkTimeInterval')
                .mockReturnValue(true);

            const result = taskPeriodsFilterService
                .available(period);

            expect(result).toEqual(false);
        });

        it('should return true, because all properties are undefined', async () => {
            const period = {} as TaskPeriod;

            jest.spyOn(dateTimeService, 'checkTimeInterval')
                .mockReturnValue(true);

            const result = taskPeriodsFilterService
                .available(period);

            expect(result).toEqual(true);
        });
    });

    describe('postponed', () => {
        it('should return true, because there\'s a postponed appointment and its date is passed', async () => {
            const period = {
                appointments: [
                    { 
                        startDate: '2024-11-01 15:00:00',
                        statusId: Status.POSTPONED,
                    } as TaskAppointment,
                ],
            } as TaskPeriod;

            jest.spyOn(dateTimeService, 'getCurrentDateTime')
                .mockReturnValue('2024-11-01 17:00:00');

            const result = taskPeriodsFilterService.postponed(period);

            expect(result).toEqual(true);
        });

        it('should return false, because there\'s a postponed appointment but its date isn\'t passed', async () => {
            const period = {
                appointments: [
                    { 
                        startDate: '2024-11-01 15:00:01',
                        statusId: Status.POSTPONED,
                    } as TaskAppointment,
                ],
            } as TaskPeriod;

            jest.spyOn(dateTimeService, 'getCurrentDateTime')
                .mockReturnValue('2024-11-01 15:00:00');

            const result = taskPeriodsFilterService.postponed(period);

            expect(result).toEqual(false);
        });
    });
});