import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ITaskAppointment } from './task-appointments.interface';
import { CreateTaskAppointmentDto } from './dto/create-task-appointment.dto';
import { UpdateTaskAppointmentDto } from './dto/update-task-appointment.dto';
import { ResultSetHeader } from 'mysql2/promise';
import { CommonHelper } from '@backend/library/common.helper';
import { DatabaseTable } from '@backend/database/database.enum';
import { DatabaseHelper } from '@backend/database/database.helper';
import { DB_CONNECTION } from '@backend/database/database.module';

@Injectable()
export class TaskAppointmentService {
  constructor(@Inject(DB_CONNECTION) private mysqlConnection: any) {}

  async createTaskAppointment(
    createTaskAppointmentDto: CreateTaskAppointmentDto,
  ): Promise<number> {
    const fields = [
      'statusId',
      'startDate',
      'endDate',
      'taskId',
      'isAdditional',
    ];

    const [result]: [ResultSetHeader] = await this.mysqlConnection.query(
      DatabaseHelper.getSqlInsert(
        DatabaseTable.TSK_APPOINTMENTS,
        CommonHelper.filterObjectProperties(createTaskAppointmentDto, fields),
      ),
    );

    return result.affectedRows;
  }

  async deleteTaskAppointment(id: number): Promise<number> {
    const [result]: [ResultSetHeader] = await this.mysqlConnection.query(`
      delete from ${DatabaseTable.TSK_APPOINTMENTS} 
      where id = '${id}'
    `);

    return result.affectedRows;
  }

  async getTaskAppointmentById(id: number): Promise<ITaskAppointment> {
    const [[taskAppointment]]: [[ITaskAppointment]] = await this.mysqlConnection
      .query(`
        select 
          id,
          statusId,
          taskId,
          startDate,
          endDate,
          isAdditional
        from ${DatabaseTable.TSK_APPOINTMENTS}
        where id = ${id}
      `);

    return taskAppointment;
  }

  async updateTaskAppointment(
    id: number,
    data: UpdateTaskAppointmentDto,
  ): Promise<number> {
    const taskAppointment = this.getTaskAppointmentById(id);

    if (!taskAppointment) {
      throw new HttpException('Назначение не найдено', HttpStatus.NOT_FOUND);
    }

    const filteredData = CommonHelper.filterObjectProperties(data, [
      'statusId',
      'startDate',
      'endDate',
    ]);

    const [updateResult]: [ResultSetHeader] = await this.mysqlConnection.query(
      DatabaseHelper.getSqlUpdate(
        DatabaseTable.TSK_APPOINTMENTS,
        filteredData,
        { id },
      ),
    );

    return updateResult.affectedRows;
  }
}
