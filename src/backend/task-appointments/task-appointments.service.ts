import { Injectable } from '@nestjs/common';
import { UpdateTaskAppointmentDto } from './dto/update-task-appointment.dto';
import { TaskAppointment } from './task-appointments.model';
import { InjectModel } from '@nestjs/sequelize';
import { Status } from './task-appointments.enum';
import { Op } from 'sequelize';
import { Task } from '@backend/tasks/tasks.model';
import { TaskPeriod } from '@backend/task-periods/task-periods.model';
import { addHours, format, addMinutes } from 'date-fns';
import { DateTimeService } from '@backend/services/date-time.service';
import { CurrentUserService } from '@backend/services/current-user.service';

@Injectable()
export class TaskAppointmentsService {
    constructor(
        @InjectModel(TaskAppointment)
        private taskAppointmentRepository: typeof TaskAppointment,
        private readonly dateTimeService: DateTimeService,
        private readonly currentUserService: CurrentUserService,
    ) { }

    async deleteTaskAppointment(id: number): Promise<number> {
        const affectedRows = await this.taskAppointmentRepository.destroy({
            where: { id },
        });

        return affectedRows;
    }

    async getTaskAppointmentById(id: number): Promise<TaskAppointment> {
        const taskAppointment = await this.taskAppointmentRepository.findOne({
            where: { id },
        });

        return taskAppointment;
    }

    /**
     * TODO: make an overload function that gets TaskAppointment object as 
     * the only parameter
     */
    async updateTaskAppointment(
        id: number,
        data: UpdateTaskAppointmentDto,
    ): Promise<number> {
        const [affectedRows] = await this.taskAppointmentRepository.update(
            data,
            { where: { id } },
        );

        return affectedRows;
    }

    async getLastTaskAppointment(): Promise<TaskAppointment> {
        const lastAppointment = await this.taskAppointmentRepository.findOne({
            where: {
                isAdditional: 0,
                statusId: [Status.COMPLETED, Status.REJECTED],
                endDate: {
                    [Op.not]: null,
                },
            },
            order: [['endDate', 'DESC'], ['id', 'DESC']],
        });

        return lastAppointment;
    }

    async getAppointmentCount(task: Task): Promise<number> {
        const periodsId = task.periods.map((period) => period.id);
        const appointmentCount = await this.taskAppointmentRepository.count({
            include: {
                model: TaskPeriod,
                as: 'period',
            },
            where: {
                taskPeriodId: {
                    [Op.in]: periodsId,
                },
                isAdditional: 0,
            },
        });

        return appointmentCount;
    }

    public async createTaskAppointment(
        task: Task,
        options?: { timeBreak?: number, isAdditional?: boolean, statusId?: Status },
    ): Promise<TaskAppointment> {
        const startDate = addHours(new Date(), options?.timeBreak ?? 0);
        const formattedStartDate = format(startDate, 'yyyy-MM-dd HH:mm:ss');
        const [period] = task.periods;
        const statusId = options?.statusId ?? Status.APPOINTED;
        const isAdditional = options?.isAdditional ?? false;

        const createTaskAppointmentDto = {
            statusId,
            isAdditional,
            startDate: formattedStartDate,
            taskPeriodId: period.id,
        };

        const taskAppointment = await this.taskAppointmentRepository.create(
            createTaskAppointmentDto,
        );

        return taskAppointment;
    }

    async getCurrentAppointmentPeriodId(): Promise<number> {
        const [taskAppointment] = await this.taskAppointmentRepository.findAll({
            include: {
                model: TaskPeriod,
                required: true,
                include: [{
                    model: Task,
                    required: true,
                    where: {
                        userId: this.currentUserService.getCurrentUser().id,
                    },
                }],
            },
            where: { 
                statusId: Status.APPOINTED,
            },
        });

        return taskAppointment?.taskPeriodId ?? null;
    }

    async setAppointmentEndStatus(
        appointment: TaskAppointment,
        statusId: Status,
    ): Promise<number> {
        const [affectedRows] = await this.taskAppointmentRepository.update(
            {
                statusId,
                endDate: this.dateTimeService.getCurrentDateTime(),
            },
            { where: { id: appointment.id } },
        );

        return affectedRows;
    }

    async postponeAppointment(
        appointment: TaskAppointment,
        postponeTimeMinutes: number,
    ): Promise<number> {
        const startDate = addMinutes(
            this.dateTimeService.getCurrentDateTime(),
            postponeTimeMinutes,
        );
        const formattedStartDate = format(startDate, 'yyyy-MM-dd HH:mm:ss');
        const [affectedRows] = await this.taskAppointmentRepository.update(
            {
                statusId: Status.POSTPONED,
                startDate: formattedStartDate,
            },
            { where: { id: appointment.id } },
        );

        return affectedRows;
    }
}
