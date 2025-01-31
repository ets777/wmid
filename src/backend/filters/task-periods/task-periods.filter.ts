import { DateTimeService } from '@backend/services/date-time.service';
import { Injectable } from '@nestjs/common';
import { TaskPeriod } from '../../task-periods/task-periods.model';
import { TaskPeriodType } from '../../task-periods/task-periods.enum';
import { format } from 'date-fns';
import { Status } from '@backend/task-appointments/task-appointments.enum';

@Injectable()
export class TaskPeriodsFilterService {
    constructor(
        private readonly dateTimeService: DateTimeService,
    ) { }

    available(period: TaskPeriod): boolean {
        return (!period.date || period.date === this.dateTimeService.getCurrentDate())
            && (!period.month || period.month === this.dateTimeService.getCurrentMonth())
            && (!period.day || period.day === this.dateTimeService.getCurrentDay())
            && (!period.weekday || period.weekday === this.dateTimeService.getCurrentWeekday());
    }

    dated(period: TaskPeriod): boolean {
        return Boolean(period.date || period.month || period.day || period.weekday);
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
    timeInterval(period: TaskPeriod): boolean {
        return this.dateTimeService.checkTime(
            period.startTime,
            period.endTime,
        );
    }

    startTime(period: TaskPeriod): boolean {
        return Boolean(period.startTime);
    }

    noStartTime(period: TaskPeriod): boolean {
        return !period.startTime;
    }

    cooldown(period: TaskPeriod): boolean {
        if (
            !period.cooldown
            || period.typeId == TaskPeriodType.ONCE
            || !period.appointments.length
        ) {
            return true;
        }

        const timeFunction = this.dateTimeService
            .getTimeFunctionDuePeriodType(period.typeId);

        const [lastestAppointment] = period.appointments.sort(
            (appointmentA, appointmentB) =>
                appointmentA.startDate > appointmentB.startDate ? -1 : 1,
        );

        return format(
            timeFunction(lastestAppointment.startDate, period.cooldown),
            'yyyy-MM-dd HH:mm:ss',
        ) <= this.dateTimeService.getCurrentDateTime();
    }

    postponed(period: TaskPeriod): boolean {
        return period.appointments
            .some(
                (appointment) => appointment.statusId == Status.POSTPONED
                    && appointment.startDate <= this.dateTimeService.getCurrentDateTime(),
            );
    }

    overdue(period: TaskPeriod): boolean {
        const currentDate = this.dateTimeService.getChainableCurrentDate();
        const currentDay = this.dateTimeService.getCurrentDay();
        const currentMonth = this.dateTimeService.getCurrentMonth();
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

        return !lastAppointmentDate
            || format(lastAppointmentDate, 'yyyy-MM-dd') < lastPlannedDate;
    }
}