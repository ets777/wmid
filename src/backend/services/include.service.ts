import { TaskAppointment } from '@backend/task-appointments/task-appointments.model';
import { TaskPeriodType } from '@backend/task-periods/task-periods.enum';
import { TaskPeriod } from '@backend/task-periods/task-periods.model';
import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import { Includeable, Op, Sequelize, WhereOptions } from 'sequelize';
import { DateTimeService } from './date-time.service';
import { Status } from '@backend/task-appointments/task-appointments.enum';

/**
 * TODO: refactor this class
 */
@Injectable()
export class IncludeService {
    constructor(private readonly dateTimeService: DateTimeService) { }

    getPeriodsWithAppointments(): Includeable {
        const currentDate = this.dateTimeService.getUserCurrentDate();

        return {
            model: TaskPeriod,
            include: [{
                model: TaskAppointment,
                required: false,
                where: {
                    [Op.or]: [
                        {
                            [Op.and]: [
                                { '$periods.typeId$': TaskPeriodType.DAILY },
                                Sequelize.where(
                                    Sequelize.col('periods.appointments.startDate'),
                                    Op.gt,
                                    this.dateTimeService
                                        .getUserChainableCurrentDate()
                                        .setDayToStart()
                                        .toDateTimeString(),
                                ),
                            ],
                        },
                        {
                            [Op.and]: [
                                { '$periods.typeId$': TaskPeriodType.WEEKLY },
                                Sequelize.where(
                                    Sequelize.fn(
                                        'WEEK',
                                        Sequelize.col('periods.appointments.startDate'),
                                    ),
                                    Op.eq,
                                    Sequelize.fn('WEEK', currentDate),
                                ),
                                Sequelize.where(
                                    Sequelize.fn(
                                        'YEAR',
                                        Sequelize.col('periods.appointments.startDate'),
                                    ),
                                    Op.eq,
                                    Sequelize.fn('YEAR', currentDate),
                                ),
                            ],
                        },
                        {
                            [Op.and]: [
                                { '$periods.typeId$': TaskPeriodType.MONTHLY },
                                Sequelize.where(
                                    Sequelize.fn(
                                        'MONTH',
                                        Sequelize.col('periods.appointments.startDate'),
                                    ),
                                    Op.eq,
                                    Sequelize.fn('MONTH', currentDate),
                                ),
                                Sequelize.where(
                                    Sequelize.fn(
                                        'YEAR',
                                        Sequelize.col('periods.appointments.startDate'),
                                    ),
                                    Op.eq,
                                    Sequelize.fn('YEAR', currentDate),
                                ),
                            ],
                        },
                        {
                            [Op.and]: [
                                { '$periods.typeId$': TaskPeriodType.YEARLY },
                                Sequelize.where(
                                    Sequelize.fn(
                                        'YEAR',
                                        Sequelize.col('periods.appointments.startDate'),
                                    ),
                                    Op.eq,
                                    Sequelize.fn('YEAR', currentDate),
                                ),
                            ],
                        },
                        { '$periods.typeId$': TaskPeriodType.ONCE },
                        { '$periods.appointments.statusId$': Status.APPOINTED },
                    ],
                },
            }],
        }
    }

    getAppointmentsInclude(): WhereOptions {
        const currentDate = format(new Date(), 'yyyy-MM-dd');

        return {
            include: [{
                model: TaskAppointment,
                required: false,
                where: {
                    [Op.or]: [
                        {
                            [Op.and]: [
                                { '$TaskPeriod.typeId$': TaskPeriodType.DAILY },
                                Sequelize.where(
                                    Sequelize.fn(
                                        'DATE',
                                        Sequelize.col('appointments.startDate'),
                                    ),
                                    Op.eq,
                                    currentDate,
                                ),
                            ],
                        },
                        {
                            [Op.and]: [
                                { '$TaskPeriod.typeId$': TaskPeriodType.WEEKLY },
                                Sequelize.where(
                                    Sequelize.fn(
                                        'WEEK',
                                        Sequelize.col('appointments.startDate'),
                                    ),
                                    Op.eq,
                                    Sequelize.fn('WEEK', currentDate),
                                ),
                                Sequelize.where(
                                    Sequelize.fn(
                                        'YEAR',
                                        Sequelize.col('appointments.startDate'),
                                    ),
                                    Op.eq,
                                    Sequelize.fn('YEAR', currentDate),
                                ),
                            ],
                        },
                        {
                            [Op.and]: [
                                { '$TaskPeriod.typeId$': TaskPeriodType.MONTHLY },
                                Sequelize.where(
                                    Sequelize.fn(
                                        'MONTH',
                                        Sequelize.col('appointments.startDate'),
                                    ),
                                    Op.eq,
                                    Sequelize.fn('MONTH', currentDate),
                                ),
                                Sequelize.where(
                                    Sequelize.fn(
                                        'YEAR',
                                        Sequelize.col('appointments.startDate'),
                                    ),
                                    Op.eq,
                                    Sequelize.fn('YEAR', currentDate),
                                ),
                            ],
                        },
                        {
                            [Op.and]: [
                                { '$TaskPeriod.typeId$': TaskPeriodType.YEARLY },
                                Sequelize.where(
                                    Sequelize.fn(
                                        'YEAR',
                                        Sequelize.col('appointments.startDate'),
                                    ),
                                    Op.eq,
                                    Sequelize.fn('YEAR', currentDate),
                                ),
                            ],
                        },
                        { '$TaskPeriod.typeId$': TaskPeriodType.ONCE },
                    ],
                },
            }],
        }
    }

    getAppointmentsInclude2(): WhereOptions {
        const currentDate = format(new Date(), 'yyyy-MM-dd');

        return {
            include: [{
                model: TaskAppointment,
                required: false,
                where: {
                    [Op.or]: [
                        {
                            [Op.and]: [
                                { '$periods.typeId$': TaskPeriodType.DAILY },
                                Sequelize.where(
                                    Sequelize.fn(
                                        'DATE',
                                        Sequelize.col('periods.appointments.startDate'),
                                    ),
                                    Op.eq,
                                    currentDate,
                                ),
                            ],
                        },
                        {
                            [Op.and]: [
                                { '$periods.typeId$': TaskPeriodType.WEEKLY },
                                Sequelize.where(
                                    Sequelize.fn(
                                        'WEEK',
                                        Sequelize.col('periods.appointments.startDate'),
                                    ),
                                    Op.eq,
                                    Sequelize.fn('WEEK', currentDate),
                                ),
                                Sequelize.where(
                                    Sequelize.fn(
                                        'YEAR',
                                        Sequelize.col('periods.appointments.startDate'),
                                    ),
                                    Op.eq,
                                    Sequelize.fn('YEAR', currentDate),
                                ),
                            ],
                        },
                        {
                            [Op.and]: [
                                { '$periods.typeId$': TaskPeriodType.MONTHLY },
                                Sequelize.where(
                                    Sequelize.fn(
                                        'MONTH',
                                        Sequelize.col('periods.appointments.startDate'),
                                    ),
                                    Op.eq,
                                    Sequelize.fn('MONTH', currentDate),
                                ),
                                Sequelize.where(
                                    Sequelize.fn(
                                        'YEAR',
                                        Sequelize.col('periods.appointments.startDate'),
                                    ),
                                    Op.eq,
                                    Sequelize.fn('YEAR', currentDate),
                                ),
                            ],
                        },
                        {
                            [Op.and]: [
                                { '$periods.typeId$': TaskPeriodType.YEARLY },
                                Sequelize.where(
                                    Sequelize.fn(
                                        'YEAR',
                                        Sequelize.col('periods.appointments.startDate'),
                                    ),
                                    Op.eq,
                                    Sequelize.fn('YEAR', currentDate),
                                ),
                            ],
                        },
                        { '$periods.typeId$': TaskPeriodType.ONCE },
                    ],
                },
            }],
        }
    }
}