import { ChainableDate } from '@backend/classes/ChainableDate';
import { TaskPeriodType } from '@backend/task-periods/task-periods.enum';
import { Injectable } from '@nestjs/common';
import { addDays, addHours, addMonths, addWeeks, format, getWeek } from 'date-fns';

type AddTimeFunction = (date: string, amount: number) => Date;

@Injectable()
export class DateTimeService {
    public getCurrentTime(): string {
        return format(
            new Date(),
            'HH:mm:ss',
        );
    }

    public getCurrentDate(): string {
        return format(new Date(), 'yyyy-MM-dd');
    }

    public getChainableCurrentDate(): ChainableDate {
        return new ChainableDate().setCurrentDate();
    }

    public getCurrentDay(): number {
        return new Date().getDate();
    }

    public getCurrentWeekday(): number {
        const weekday = new Date().getDay();

        return weekday == 0 ? 7 : weekday;
    }

    public getCurrentWeek(): number {
        return getWeek(new Date());
    }

    public getCurrentMonth(): number {
        return new Date().getMonth() + 1;
    }

    public getCurrentYear(): number {
        return new Date().getFullYear();
    }

    public getCurrentDateTime(): string {
        return format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    }

    public checkTime(startTime: string, endTime: string): boolean {
        const currentTime = this.getCurrentTime();        

        if (!startTime && !endTime) {
            return true;
        }

        startTime = startTime ?? '00:00:00';
        endTime = endTime ?? '23:59:00';
        
        if (endTime > startTime) {
            return startTime <= currentTime && endTime > currentTime;
        } else {
            return startTime >= currentTime || endTime < currentTime;
        }
    }

    public getTimeFunctionDuePeriodType(periodTypeId: TaskPeriodType): AddTimeFunction {
        switch (periodTypeId) {
            case TaskPeriodType.DAILY:
                return addHours;
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
