import { Injectable } from '@nestjs/common';
import { CreateTaskPeriodDto } from './dto/create-task-period.dto';
import { InjectModel } from '@nestjs/sequelize';
import { TaskPeriod } from './task-periods.model';
import { PeriodFilter, IProcessOptions } from '@backend/filters/process-options.interface';
import { TaskAppointmentsService } from '@backend/task-appointments/task-appointments.service';
import { TaskPeriodsFilterService } from '@backend/filters/task-periods/task-periods.filter';
import { Status } from '@backend/task-appointments/task-appointments.enum';
import { IncludeService } from '@backend/services/include.service';
import { UpdateTaskPeriodDto } from './dto/update-task-period.dto';
import { DateTimeService } from '@backend/services/date-time.service';
import { Time } from '@backend/classes/Time';

@Injectable()
export class TaskPeriodsService {
    constructor(
        @InjectModel(TaskPeriod)
        private taskPeriodRepository: typeof TaskPeriod,
        private readonly taskAppointmentsService: TaskAppointmentsService,
        private readonly periodsFilter: TaskPeriodsFilterService,
        private readonly includeService: IncludeService,
        private readonly dateTimeService: DateTimeService,
    ) { }

    private adjustTimeWithTimezoneOffset(dto: CreateTaskPeriodDto | UpdateTaskPeriodDto): void {
        if (dto.startTime || dto.endTime) {
            const offsetMinutes = this.dateTimeService.getUserTimezoneOffsetInMinutes();

            if (dto.startTime) {
                const time = new Time(dto.startTime);
                dto.startTime = time.addMinutes(-offsetMinutes).toString();
            }
            if (dto.endTime) {
                const time = new Time(dto.endTime);
                dto.endTime = time.addMinutes(-offsetMinutes).toString();
            }
        }
    }

    public async createTaskPeriod(
        dto: CreateTaskPeriodDto | UpdateTaskPeriodDto,
    ): Promise<TaskPeriod> {
        this.adjustTimeWithTimezoneOffset(dto);
        const task = await this.taskPeriodRepository.create(dto);
        return task;
    }

    public async deleteTaskPeriod(id: number): Promise<number> {
        const affectedRows = await this.taskPeriodRepository.destroy({
            where: { id },
        });

        return affectedRows;
    }

    public async updateTaskPeriod(dto: UpdateTaskPeriodDto): Promise<number> {
        this.adjustTimeWithTimezoneOffset(dto);
        const [affectedRows] = await this.taskPeriodRepository.update(
            dto,
            {
                where: { id: dto.id },
            },
        );

        return affectedRows;
    }

    public async getTaskPeriodById(periodId: number): Promise<TaskPeriod> {
        const taskPeriod = await this.taskPeriodRepository.findOne({
            ...this.includeService.getAppointmentsInclude(),
            where: {
                id: periodId,
            },
        });

        return taskPeriod;
    }

    /**
     * Applies a list of filters to an array of TaskPeriods. Each filter can be 
     * a single function or an array of functions. Single functions are treated 
     * as AND conditions, while arrays of functions are treated as OR conditions.
     * 
     * Example: [a, b, [c, d]] = a && b && (c || d)
     */
    public filterPeriods(
        periods: TaskPeriod[],
        filters: PeriodFilter[],
    ): TaskPeriod[] {
        return periods.filter(
            (period) => filters.every(
                (filter) => {
                    if (Array.isArray(filter)) {
                        return filter.some(
                            (filter) => filter.call(this.periodsFilter, period),
                        );
                    }
                    return filter.call(this.periodsFilter, period);
                },
            ),
        );
    }

    public processTaskPeriods(
        periods: TaskPeriod[],
        options: IProcessOptions,
    ): TaskPeriod[] {
        periods = this.filterPeriods(periods, options.periodFilters);

        if (options.sort) {
            periods = this.sortPeriods(periods);
        }

        return periods;
    }

    public sortPeriods(periods: TaskPeriod[]): TaskPeriod[] {
        return periods
            .sort(
                (periodA, periodB) =>
                    periodA.startTime < periodB.startTime ? -1 : 1,
            );
    }

    public async getCurrentPeriod(): Promise<TaskPeriod> {
        const periodId = await this.taskAppointmentsService
            .getCurrentAppointmentPeriodId();

        if (!periodId) {
            return null;
        }

        return await this.getTaskPeriodById(periodId);
    }

    public async setAppointmentEndStatus(
        period: TaskPeriod,
        statusId: Status,
    ): Promise<number> {
        const appointment = period.appointments.find(
            (appointment) => appointment.statusId == Status.APPOINTED,
        );

        return await this.taskAppointmentsService
            .setAppointmentEndStatus(appointment, statusId);
    }

    public async postponeAppointment(
        period: TaskPeriod,
        postponeTimeMinutes: number,
    ): Promise<number> {
        const appointment = period.appointments.find(
            (appointment) => appointment.statusId == Status.APPOINTED,
        );

        return await this.taskAppointmentsService
            .postponeAppointment(appointment, postponeTimeMinutes);
    }

    public getAppointedPeriod(periods: TaskPeriod[]): TaskPeriod {
        return periods.find(
            (period) => period.appointments.some(
                (appointment) => appointment.statusId === Status.APPOINTED,
            ),
        );
    }

    public async getTaskPeriodsByTaskId(taskId: number): Promise<TaskPeriod[]> {
        const taskPeriods = await this.taskPeriodRepository.findAll({
            ...this.includeService.getAppointmentsInclude(),
            where: {
                taskId,
            },
        });

        return taskPeriods;
    }
}
