import { ChainableDate } from '@backend/classes/ChainableDate';
import { TaskPeriodType } from '@backend/task-periods/task-periods.enum';
import { Injectable } from '@nestjs/common';
import { addDays, addMinutes, addMonths, addWeeks, format, getWeek } from 'date-fns';
import { CurrentUserService } from './current-user.service';

type AddTimeFunction = (date: string, amount: number) => Date;

@Injectable()
export class DateTimeService {
    constructor(
        private readonly currentUserService: CurrentUserService,
    ) {}

    public getCurrentTime(): string {
        return format(new Date(), 'HH:mm:ss');
    }

    public getUserCurrentDate(): string {
        return format(this.getDateWithUserTimezoneOffset(), 'yyyy-MM-dd');
    }

    public getCurrentDateTime(): string {
        return format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    }

    public getUserChainableCurrentDate(): ChainableDate {
        const offset = this.getUserTimezoneOffsetInMinutes();

        return new ChainableDate().setCurrentDate().addMinutes(offset);
    }

    public getUserCurrentDay(): number {
        return this.getDateWithUserTimezoneOffset().getDate();
    }

    public getUserCurrentWeekday(): number {
        const weekday = this.getDateWithUserTimezoneOffset().getDay();

        return weekday == 0 ? 7 : weekday;
    }

    public getCurrentWeek(): number {
        return getWeek(new Date());
    }

    public getUserCurrentMonth(): number {
        return this.getDateWithUserTimezoneOffset().getMonth() + 1;
    }

    private getDateWithUserTimezoneOffset(): Date {
        const offset = this.getUserTimezoneOffsetInMinutes();

        return addMinutes(new Date(), offset);
    }

    public getCurrentYear(): number {
        return new Date().getFullYear();
    }

    public checkTimeInterval(startTime: string, endTime: string): boolean {
        const currentTime = this.getCurrentTime();

        if (!startTime && !endTime) {
            return true;
        }

        startTime = startTime ?? '00:00:00';
        endTime = endTime ?? '23:59:59';

        if (endTime > startTime) {
            return startTime <= currentTime && endTime > currentTime;
        } else {
            return startTime <= currentTime || endTime > currentTime;
        }
    }

    public checkTimeInFuture(startTime: string, endTime: string): boolean {
        const currentTime = this.getCurrentTime();

        if (!startTime && !endTime) {
            return true;
        }

        startTime = startTime ?? '00:00:00';
        endTime = endTime ?? '23:59:59';

        if (endTime > startTime) {
            return endTime > currentTime;
        } else {
            /**
             * If startTime > endTime we consider that task will be in the 
             * future all current day, because we expected that the task will 
             * start at next day (for example 01:00).
             */
            return true;
        }
    }

    /**
     * Converts current user's timezone from +XX:XX to offset in minutes.
     * For example +07:00 into 420.  
     */
    public getUserTimezoneOffsetInMinutes(): number {
        const user = this.currentUserService.getCurrentUser();
        const timezone = user.timezone;

        if (!/^[+-]\d{2}:\d{2}$/.test(timezone)) {
            throw new Error('Invalid timezone format. Expected format: "+XX:XX" or "-XX:XX"');
        }

        const sign = timezone.charAt(0) === '+' ? 1 : -1;
        const [hours, minutes] = timezone.substring(1).split(':').map(Number);
        
        return sign * (hours * 60 + minutes);
    }

    public getTimeFunctionDuePeriodType(
        periodTypeId: TaskPeriodType,
    ): AddTimeFunction {
        switch (periodTypeId) {
            case TaskPeriodType.DAILY:
                return addMinutes;
            case TaskPeriodType.WEEKLY:
                return addDays;
            case TaskPeriodType.MONTHLY:
                return addWeeks;
            case TaskPeriodType.YEARLY:
                return addMonths;
            default:
                throw new Error('Invalid period type');
        }
    }
}
