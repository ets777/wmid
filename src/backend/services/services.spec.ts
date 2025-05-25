import { Test, TestingModule } from '@nestjs/testing';
import { DateTimeService } from '@backend/services/date-time.service';
import { CurrentUserService } from './current-user.service';

describe('DateTimeService', () => {
    let dateTimeService: DateTimeService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DateTimeService,
                CurrentUserService,
            ],
        }).compile();

        dateTimeService = module.get<DateTimeService>(DateTimeService);
    });

    describe('checkTimeInterval', () => {
        it('should return true, because current time is between start and end time', () => {
            jest.spyOn(dateTimeService, 'getCurrentTime')
                .mockReturnValue('09:30:00');

            const result = dateTimeService.checkTimeInterval('09:00:00', '10:00:00');

            expect(result).toEqual(true);
        });

        it('should return false, because current time isn\'t between start and end time', () => {
            jest.spyOn(dateTimeService, 'getCurrentTime')
                .mockReturnValue('10:30:00');

            const result = dateTimeService.checkTimeInterval('09:00:00', '10:00:00');

            expect(result).toEqual(false);
        });

        it('should return true, because current time is later than start time and end time is sooner than start time', () => {
            jest.spyOn(dateTimeService, 'getCurrentTime')
                .mockReturnValue('21:30:00');

            const result = dateTimeService.checkTimeInterval('21:00:00', '06:00:00');

            expect(result).toEqual(true);
        });

        it('should return true, because current time is sooner than end time and end time is sooner than start time', () => {
            jest.spyOn(dateTimeService, 'getCurrentTime')
                .mockReturnValue('05:30:00');

            const result = dateTimeService.checkTimeInterval('21:00:00', '06:00:00');

            expect(result).toEqual(true);
        });

        it('should return false, because current time is between start and end time and end time is sooner than start time', () => {
            jest.spyOn(dateTimeService, 'getCurrentTime')
                .mockReturnValue('20:30:00');

            const result = dateTimeService.checkTimeInterval('21:00:00', '06:00:00');

            expect(result).toEqual(false);
        });
    });
});