import { Inject, Injectable } from '@nestjs/common';
import { ITaskPeriod } from './task-periods.interface';
import { CreateTaskPeriodDto } from './dto/create-task-period.dto';
import { DB_CONNECTION } from '@backend/database/database.module';
import { ResultSetHeader } from 'mysql2/promise';
import { DatabaseHelper } from '@backend/database/database.helper';
import { CommonHelper } from '@backend/library/common.helper';
import { DatabaseTable } from '@backend/database/database.enum';

@Injectable()
export class TaskPeriodsService {
  constructor(@Inject(DB_CONNECTION) private mysqlConnection: any) {}

  async createTaskPeriod(
    createTaskPeriodDto: CreateTaskPeriodDto,
  ): Promise<number> {
    const fields = [
      'typeId',
      'startTime',
      'endTime',
      'weekday',
      'day',
      'month',
      'date',
      'taskId',
    ];

    const [result]: [ResultSetHeader] = await this.mysqlConnection.query(
      DatabaseHelper.getSqlInsert(
        DatabaseTable.TSK_PERIODS,
        CommonHelper.filterObjectProperties(createTaskPeriodDto, fields),
      ),
    );

    return result.affectedRows;
  }

  async deleteTaskPeriod(id: number): Promise<number> {
    const [result]: [ResultSetHeader] = await this.mysqlConnection.query(`
      delete from ${DatabaseTable.TSK_PERIODS} 
      where id = '${id}'
    `);

    return result.affectedRows;
  }

  async getTaskCategoryById(id: number): Promise<ITaskPeriod> {
    const [[taskAppointment]]: [[ITaskPeriod]] = await this.mysqlConnection
      .query(`
        select 
          id,
          typeId,
          taskId,
          startTime,
          endTime,
          weekday,
          day,
          month,
          date
        from ${DatabaseTable.TSK_PERIODS}
        where id = ${id}
      `);

    return taskAppointment;
  }
}
