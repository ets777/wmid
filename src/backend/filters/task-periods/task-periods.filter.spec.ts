import { Test, TestingModule } from '@nestjs/testing';
import { DateTimeService } from '@backend/services/date-time.service';
import { TaskPeriod } from '../../task-periods/task-periods.model';
import { TaskPeriodType } from '../../task-periods/task-periods.enum';
import { TaskAppointment } from '@backend/task-appointments/task-appointments.model';
import { addHours } from 'date-fns';
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
                        getCurrentDate: jest.fn(),
                        getCurrentMonth: jest.fn(),
                        getCurrentDay: jest.fn(),
                        getCurrentWeekday: jest.fn(),
                        getCurrentDateTime: jest.fn(),
                        checkTime: jest.fn(),
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

            jest.spyOn(dateTimeService, 'getCurrentDate')
                .mockReturnValue('2024-10-31');

            const result = taskPeriodsFilterService.available(period);

            expect(result).toEqual(true);
        });

        it('should return false, because the period is not available for current date', async () => {
            const period = { date: '2024-10-30' } as TaskPeriod;

            jest.spyOn(dateTimeService, 'getCurrentDate')
                .mockReturnValue('2024-10-31');

            const result = taskPeriodsFilterService.available(period);

            expect(result).toEqual(false);
        });

        it('should return true, because the period is available for current month and day', async () => {
            const period = { month: 10, day: 30 } as TaskPeriod;

            jest.spyOn(dateTimeService, 'getCurrentMonth')
                .mockReturnValue(10);

            jest.spyOn(dateTimeService, 'getCurrentDay')
                .mockReturnValue(30);

            const result = taskPeriodsFilterService.available(period);

            expect(result).toEqual(true);
        });

        it('should return false, because the period is not available for current month and day', async () => {
            const period = { month: 10, day: 30 } as TaskPeriod;

            jest.spyOn(dateTimeService, 'getCurrentMonth')
                .mockReturnValue(10);

            jest.spyOn(dateTimeService, 'getCurrentDay')
                .mockReturnValue(31);

            const result = taskPeriodsFilterService
                .available(period);

            expect(result).toEqual(false);
        });

        it('should return true, because the period is available for current weekday', async () => {
            const period = { weekday: 3 } as TaskPeriod;

            jest.spyOn(dateTimeService, 'getCurrentWeekday')
                .mockReturnValue(3);

            jest.spyOn(dateTimeService, 'checkTime')
                .mockReturnValue(true);

            const result = taskPeriodsFilterService
                .available(period);

            expect(result).toEqual(true);
        });

        it('should return false, because the period is not available for current weekday', async () => {
            const period = { weekday: 3 } as TaskPeriod;

            jest.spyOn(dateTimeService, 'getCurrentWeekday')
                .mockReturnValue(4);

            jest.spyOn(dateTimeService, 'checkTime')
                .mockReturnValue(true);

            const result = taskPeriodsFilterService
                .available(period);

            expect(result).toEqual(false);
        });

        it('should return true, because all properties are undefined', async () => {
            const period = {} as TaskPeriod;

            jest.spyOn(dateTimeService, 'checkTime')
                .mockReturnValue(true);

            const result = taskPeriodsFilterService
                .available(period);

            expect(result).toEqual(true);
        });
    });

    describe('cooldown', () => {
        it('should return true, because cooldown was passed', async () => {
            const period = {
                typeId: TaskPeriodType.DAILY,
                cooldown: 2,
                appointments: [
                    { startDate: '2024-11-01 15:00:00' } as TaskAppointment,
                    { startDate: '2024-10-31 17:00:00' } as TaskAppointment,
                    { startDate: '2024-10-31 15:00:00' } as TaskAppointment,
                ],
            } as TaskPeriod;

            jest.spyOn(dateTimeService, 'getCurrentDateTime')
                .mockReturnValue('2024-11-01 17:00:00');

            jest.spyOn(dateTimeService, 'getTimeFunctionDuePeriodType')
                .mockReturnValue(addHours);

            const result = taskPeriodsFilterService.cooldown(period);

            expect(result).toEqual(true);
        });

        it('should return false, because cooldown wasn\'t passed', async () => {
            const period = {
                typeId: TaskPeriodType.DAILY,
                cooldown: 2,
                appointments: [
                    { startDate: '2024-11-01 15:00:00' } as TaskAppointment,
                    { startDate: '2024-10-31 17:00:00' } as TaskAppointment,
                    { startDate: '2024-10-31 15:00:00' } as TaskAppointment,
                ],
            } as TaskPeriod;

            jest.spyOn(dateTimeService, 'getCurrentDateTime')
                .mockReturnValue('2024-11-01 16:59:59');

            jest.spyOn(dateTimeService, 'getTimeFunctionDuePeriodType')
                .mockReturnValue(addHours);

            const result = taskPeriodsFilterService.cooldown(period);

            expect(result).toEqual(false);
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