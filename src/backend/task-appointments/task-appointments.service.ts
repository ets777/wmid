import { Injectable } from '@nestjs/common';
import { UpdateTaskAppointmentDto } from './dto/update-task-appointment.dto';
import { TaskAppointment } from './task-appointments.model';
import { InjectModel } from '@nestjs/sequelize';
import { Status } from './task-appointments.enum';
import { Op } from 'sequelize';
import { Task } from '@backend/tasks/tasks.model';
import { TaskPeriod } from '@backend/task-periods/task-periods.model';
import { addHours, format } from 'date-fns';
import { DateTimeService } from '@backend/services/date-time.service';

@Injectable()
export class TaskAppointmentsService {
    constructor(
        @InjectModel(TaskAppointment)
        private taskAppointmentRepository: typeof TaskAppointment,
        private readonly dateTimeService: DateTimeService,
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

    async createTaskAppointment(
        task: Task,
        options?: { timeBreak?: number, isAdditional?: boolean, statusId?: Status },
    ): Promise<TaskAppointment> {
        const nowUTC = new Date();
        const startDate = addHours(nowUTC, options?.timeBreak ?? 0);
        const formattedStartDate = format(startDate, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
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
        console.log('test3');

        const [taskAppointment] = await this.taskAppointmentRepository.findAll({
            where: { statusId: Status.APPOINTED },
        });

        console.log('taskAppointment', taskAppointment);

        return taskAppointment?.taskPeriodId ?? null;
    }

    async setAppointmentCompleted(appointment: TaskAppointment): Promise<number> {
        const [affectedRows] = await this.taskAppointmentRepository.update(
            { 
                statusId: Status.COMPLETED,
                endDate: this.dateTimeService.getCurrentDateTime(),
            },
            { where: { id: appointment.id } },
        );

        return affectedRows;
    }
}
