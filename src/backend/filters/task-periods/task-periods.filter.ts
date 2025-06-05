import { DateTimeService } from '@backend/services/date-time.service';
import { Injectable } from '@nestjs/common';
import { TaskPeriod } from '@backend/task-periods/task-periods.model';
import { format } from 'date-fns';
import { Status } from '@backend/task-appointments/task-appointments.enum';
import { Time } from '@backend/classes/Time';

@Injectable()
export class TaskPeriodsFilterService {
    constructor(
        private readonly dateTimeService: DateTimeService,
    ) { }

    available(period: TaskPeriod): boolean {
        return (!period.date || period.date === this.dateTimeService.getUserCurrentDate())
            && (!period.month || period.month === this.dateTimeService.getUserCurrentMonth())
            && (!period.day || period.day === this.dateTimeService.getUserCurrentDay())
            && (!period.weekday || period.weekday === this.dateTimeService.getUserCurrentWeekday());
    }

    dated(period: TaskPeriod): boolean {
        return Boolean(period.date || period.month || period.day || period.weekday);
    }

    notDated(period: TaskPeriod): boolean {
        return !period.date && !period.month && !period.day && !period.weekday;
    }

    free(period: TaskPeriod): boolean {
        /**
         * Each period can have only one appointment during its time interval 
         * depending on period type. So period supposed free only if there's no 
         * appointment.
         */
        return !period.appointments.length;
    }

    /**
     * TODO: take isImportant into consideration while checking the time
     */
    public timeInterval(period: TaskPeriod): boolean {
        const offset = period.offset ?? 0;
        const startTime = new Time(period.startTime).addMinutes(-offset).toString();
        const result = this.dateTimeService.checkTimeInterval(
            startTime,
            period.endTime,
        );

        return result
    }

    /**
     * TODO: take isImportant and offset into consideration while checking 
     * the time
     */
    public inFuture(period: TaskPeriod): boolean {
        const result = this.dateTimeService.checkTimeInFuture(
            period.startTime,
            period.endTime,
        );

        return result
    }

    startTime(period: TaskPeriod): boolean {
        return Boolean(period.startTime);
    }

    isImportant(period: TaskPeriod): boolean {
        return period.isImportant;
    }

    noStartTime(period: TaskPeriod): boolean {
        return !period.startTime;
    }

    postponed(period: TaskPeriod): boolean {
        return period.appointments
            .some(
                (appointment) => appointment.statusId == Status.POSTPONED
                    && format(appointment.startDate, 'yyyy-MM-dd HH:mm:ss') <= this.dateTimeService.getCurrentDateTime(),
            );
    }

    overdue(period: TaskPeriod): boolean {
        const currentDate = this.dateTimeService.getUserChainableCurrentDate();
        const currentDay = this.dateTimeService.getUserCurrentDay();
        const currentMonth = this.dateTimeService.getUserCurrentMonth();
        const currentYear = this.dateTimeService.getCurrentYear();

        /**
         * TODO: add conditions for weekdays as well.
         */
        const map = [
            {
                condition: !period.date && !period.month && period.day <= currentDay,
                date: currentDate.setDay(period.day).toDateString(),
            },
            {
                condition: !period.date && !period.month && period.day > currentDay,
                date: currentDate.setMonth(currentMonth - 1).setDay(period.day).toDateString(),
            },
            {
                condition: !period.date && period.month < currentMonth && Boolean(period.day),
                date: currentDate.setMonth(period.month).setDay(period.day).toDateString(),
            },
            {
                condition: !period.date && period.month > currentMonth && Boolean(period.day),
                date: currentDate.setYear(currentYear - 1).setMonth(period.month).setDay(period.day).toDateString(),
            },
            {
                condition: !period.date && period.month === currentMonth && period.day <= currentDay,
                date: currentDate.setDay(period.day).toDateString(),
            },
            {
                condition: !period.date && period.month === currentMonth && period.day > currentDay,
                date: currentDate.setYear(currentYear - 1).setDay(period.day).toDateString(),
            },
            {
                condition: !period.date && period.month <= currentMonth && !period.day,
                date: currentDate.setMonth(period.month).setDay(1).toDateString(),
            },
            {
                condition: !period.date && period.month > currentMonth && !period.day,
                date: currentDate.setYear(currentYear - 1).setMonth(period.month).setDay(1).toDateString(),
            },
            {
                condition: Boolean(period.date),
                date: period.date,
            },
        ];

        const lastAppointmentDate = period.appointments[0]?.startDate;
        const lastPlannedDate = map.find((item) => item.condition)?.date;

        return lastAppointmentDate 
            && lastPlannedDate
            && format(lastAppointmentDate, 'yyyy-MM-dd') < lastPlannedDate;
    }
}