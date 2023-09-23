import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ITask } from './tasks.interface';
import { CreateTaskControllerDto } from './dto/create-task-controller.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskPeriodsService } from '@backend/task-periods/task-periods.service';
import { CreateTaskPeriodDto } from '@backend/task-periods/dto/create-task-period.dto';
import { UserFromTokenDto } from 'users/dto/user-from-token.dto';
import { CreateTaskServiceDto } from './dto/create-task-service.dto';
import { Status } from '@backend/task-appointments/task-appointments.enum';
import { TaskPeriodType } from '@backend/task-periods/task-periods.enum';
import { AppointedTaskDto } from './dto/apointed-task.dto';
import { AppointTaskParamsDto } from './dto/apointed-task-params.dto';
import { TaskRelationType } from './tasks.enum';
import { DB_CONNECTION } from '@backend/database/database.module';
import { ResultSetHeader } from 'mysql2/promise';
import { DatabaseHelper } from '@backend/database/database.helper';
import { DatabaseTable } from '@backend/database/database.enum';
import { CommonHelper } from '@backend/library/common.helper';

interface INextTask {
  id: number;
  timeBreak: number;
}

interface IAdditionalTask {
  taskId: number;
  canBeAppointed: boolean;
  statusId: Status;
  text: string;
  appointmentId?: number;
}

interface ITimeTask {
  canBeAppointed: boolean;
  taskId: number;
  startTime: string;
  endTime?: string;
  isInChain?: boolean;
  offset?: number;
}

@Injectable()
export class TasksService {
  private currentTime: string;
  private currentDate: string;
  private testMode = false;

  constructor(
    @Inject(DB_CONNECTION) private mysqlConnection: any,
    private taskPeriodsService: TaskPeriodsService,
  ) {}

  async createTask(
    createTaskControllerDto: CreateTaskControllerDto,
    userFromTokenDto: UserFromTokenDto,
  ): Promise<number> {
    const createTaskServiceDto: CreateTaskServiceDto = {
      ...createTaskControllerDto,
      userId: userFromTokenDto.id,
    };

    const fields = [
      'userId',
      'text',
      'duration',
      'categoryId',
      'isActive',
      'cooldown',
      'nextTaskBreak',
      'endDate',
      'offset',
      'isImportant',
      'nextTaskId',
    ];

    const [result]: [ResultSetHeader] = await this.mysqlConnection.query(
      DatabaseHelper.getSqlInsert(
        DatabaseTable.TSK_TASKS,
        CommonHelper.filterObjectProperties(createTaskServiceDto, fields),
      ),
    );

    if (
      Array.isArray(createTaskServiceDto.periods) &&
      createTaskServiceDto.periods.length > 0
    ) {
      createTaskServiceDto.periods.forEach((period: CreateTaskPeriodDto) => {
        period.taskId = result.insertId;
        this.taskPeriodsService.createTaskPeriod(period);
      });
    }

    return result.affectedRows;
  }

  async deleteTask(id: number): Promise<number> {
    const task = await this.getTaskById(id);

    if (!task) {
      throw new HttpException('Задание не найдено', HttpStatus.NOT_FOUND);
    }

    const affectedRows = await this.updateTask(id, {
      isDeleted: true,
    });

    return affectedRows;
  }

  async getTaskById(id: number): Promise<ITask> {
    const [[task]]: [[ITask]] = await this.mysqlConnection.query(`
      select 
        id,
        text,
        nextTaskBreak,
        endDate,
        offset,
        duration,
        isActive,
        isDeleted,
        cooldown,
        isImportant,
        categoryId,
        userId,
        nextTaskId
      from ${DatabaseTable.TSK_TASKS}
      where id = ${id}
    `);

    if (task) {
      task.isActive = Boolean(task.isActive);
      task.isDeleted = Boolean(task.isDeleted);
      task.isImportant = Boolean(task.isImportant);
    }

    return task;
  }

  async getAllTasks(): Promise<ITask[]> {
    let [tasks]: [ITask[]] = await this.mysqlConnection.query(`
      select 
        id,
        text,
        nextTaskBreak,
        endDate,
        offset,
        duration,
        isActive,
        isDeleted,
        cooldown,
        isImportant,
        categoryId,
        userId,
        nextTaskId
      from ${DatabaseTable.TSK_TASKS}
    `);

    if (!CommonHelper.isEmptyArray(tasks)) {
      tasks = tasks.map((task) =>
        CommonHelper.convertToBooleanProperties<ITask>(task, [
          'isActive',
          'isDeleted',
          'isImportant',
        ]),
      );
    }

    return tasks;
  }

  async updateTask(id: number, data: UpdateTaskDto): Promise<number> {
    const task = await this.getTaskById(id);

    if (!task) {
      throw new HttpException('Задание не найдено', HttpStatus.NOT_FOUND);
    }

    const fields = [
      'nextTaskBreak',
      'isImportant',
      'categoryId',
      'nextTaskId',
      'duration',
      'cooldown',
      'endDate',
      'isActive',
      'offset',
      'text',
    ];

    const [result]: [ResultSetHeader] = await this.mysqlConnection.query(
      DatabaseHelper.getSqlUpdate(
        DatabaseTable.TSK_TASKS,
        CommonHelper.filterObjectProperties(data, fields),
        { id },
        true,
      ),
    );

    return result.affectedRows;
  }

  private setParams(params: AppointTaskParamsDto): void {
    if (params.currentDate && params.currentTime) {
      this.currentTime = params.currentTime;
      this.currentDate = params.currentDate;
    } else {
      this.currentTime = this.getCurrentTime();
      this.currentDate = this.getCurrentDate();
    }

    if (params.testMode === true) {
      this.testMode = params.testMode;
    }
  }

  private async getLastAppointmentId(): Promise<number> {
    const lastAppointmentQuery = `
      select 
        id lastAppointmentId
      from ${DatabaseTable.TSK_APPOINTMENTS}
      where isAdditional = 0
        and statusId = ${Status.COMPLETED}
      order by endDate desc
      limit 1
    `;

    const [[{ lastAppointmentId }]] = await this.mysqlConnection.query(
      lastAppointmentQuery,
    );

    return lastAppointmentId;
  }

  private async getNextTask(lastAppointmentId): Promise<INextTask> {
    const nextTaskQuery = `
      select 
        t.nextTaskId id, 
        t.nextTaskBreak timeBreak
      from ${DatabaseTable.TSK_APPOINTMENTS} a 
      join ${DatabaseTable.TSK_TASKS} t 
        on t.id = a.taskId 
      where a.id = ${lastAppointmentId}
    `;

    const [[nextTask]] = await this.mysqlConnection.query(nextTaskQuery);

    return nextTask;
  }

  async appointTask(
    params: AppointTaskParamsDto,
  ): Promise<AppointedTaskDto | null> {
    this.setParams(params);

    const lastAppointmentId =
      params.lastAppointmentId ?? (await this.getLastAppointmentId());

    if (lastAppointmentId) {
      const nextTask = await this.getNextTask(lastAppointmentId);
      const nextTaskResult = await this.appointNextTask(nextTask);

      if (nextTaskResult) {
        return nextTaskResult;
      }
    }

    // Поиск ближайшего задания на время
    const timeTask = await this.getTimeTask();
    const timeTaskAppointment = await this.appointTimeTask(timeTask);

    if (timeTaskAppointment) {
      return timeTaskAppointment;
    }

    // Поиск заданий с конкретной датой
    const datedResult = await this.appointDatedTask(timeTask.startTime);

    if (datedResult) {
      return datedResult;
    }

    // Поиск отложенных заданий, на выполнение которых не будет затрачено больше, чем осталось до задания на время
    const postponedResult = await this.appointPostponedTask(timeTask.startTime);

    if (postponedResult) {
      return postponedResult;
    }

    // Выбор из пула доступных заданий
    const randomTaskResult = await this.appointRandomTask(timeTask.startTime);

    if (randomTaskResult) {
      return randomTaskResult;
    }

    return null;
  }

  async completeTask(appointedTaskDto: AppointedTaskDto): Promise<number> {
    const updateAppointmentQuery = `update ${DatabaseTable.TSK_APPOINTMENTS} 
      set statusId = ${Status.COMPLETED}, endDate = now()
      where id = ${appointedTaskDto.appointmentId}`;

    const [updateResult] = await this.mysqlConnection.query(
      updateAppointmentQuery,
    );

    const completedAdditional = appointedTaskDto.additionalTasks
      ?.filter((task) => task.isCompleted)
      .map((task) => task.appointmentId);

    if (completedAdditional?.length > 0) {
      const updateCompletedAdditionalAppointmentsQuery = `
        update ${DatabaseTable.TSK_APPOINTMENTS} 
        set statusId = ${Status.COMPLETED}, endDate = now()
        where id in (${completedAdditional.join(',')})
      `;

      await this.mysqlConnection.query(
        updateCompletedAdditionalAppointmentsQuery,
      );
    }

    const rejectedAdditional = appointedTaskDto.additionalTasks
      ?.filter((task) => !task.isCompleted)
      .map((task) => task.appointmentId);

    if (rejectedAdditional?.length > 0) {
      const updateRejectedAdditionalAppointmentsQuery = `
        update ${DatabaseTable.TSK_APPOINTMENTS} 
        set statusId = ${Status.REJECTED}, endDate = now()
        where id in (${rejectedAdditional.join(',')})
      `;

      await this.mysqlConnection.query(
        updateRejectedAdditionalAppointmentsQuery,
      );
    }

    return updateResult.affectedRows;
  }

  async rejectTask(appointedTaskDto: AppointedTaskDto): Promise<number> {
    const updateAppointmentQuery = `
      update ${DatabaseTable.TSK_APPOINTMENTS} 
      set statusId = ${Status.REJECTED}, endDate = now()
      where id = ${appointedTaskDto.appointmentId}
    `;

    const [updateResult] = await this.mysqlConnection.query(
      updateAppointmentQuery,
    );

    if (!CommonHelper.isEmptyArray(appointedTaskDto.additionalTasks)) {
      const rejectedAdditional = appointedTaskDto.additionalTasks.map(
        (task) => task.appointmentId,
      );

      const updateRejectedAdditionalAppointmentsQuery = `
        update ${DatabaseTable.TSK_APPOINTMENTS} 
        set statusId = ${Status.REJECTED}, endDate = now()
        where id in (${rejectedAdditional.join(',')})
      `;

      await this.mysqlConnection.query(
        updateRejectedAdditionalAppointmentsQuery,
      );
    }

    return updateResult.affectedRows;
  }

  async postponeTask(appointedTaskDto: AppointedTaskDto): Promise<number> {
    const updateAppointmentQuery = `
      update ${DatabaseTable.TSK_APPOINTMENTS} 
      set statusId = ${Status.POSTPONED}, startDate = DATE(startDate) + INTERVAL 1 DAY
      where id = ${appointedTaskDto.appointmentId}
    `;

    const [updateResult] = await this.mysqlConnection.query(
      updateAppointmentQuery,
    );

    console.log(CommonHelper.isEmptyArray(appointedTaskDto.additionalTasks));
    if (!CommonHelper.isEmptyArray(appointedTaskDto.additionalTasks)) {
      const rejectedAdditional = appointedTaskDto.additionalTasks.map(
        (task) => task.appointmentId,
      );

      const updateRejectedAdditionalAppointmentsQuery = `
        update ${DatabaseTable.TSK_APPOINTMENTS} 
        set statusId = ${Status.REJECTED}, endDate = now()
        where id in (${rejectedAdditional.join(',')})
      `;

      await this.mysqlConnection.query(
        updateRejectedAdditionalAppointmentsQuery,
      );
    }

    return updateResult.affectedRows;
  }

  async getCurrent(): Promise<AppointedTaskDto | null> {
    const lastAppointmentQuery = `select 
        t.id taskId,
        ta.id appointmentId,
        t.text
      from ${DatabaseTable.TSK_APPOINTMENTS} ta
      join ${DatabaseTable.TSK_TASKS} t on t.id = ta.taskId
      where ta.isAdditional = 0
        and ta.statusId = ${Status.APPOINTED}
      order by ta.endDate desc 
      limit 1`;

    const [[lastAppointmentResult]] = await this.mysqlConnection.query(
      lastAppointmentQuery,
    );

    if (!lastAppointmentResult?.taskId) {
      return null;
    }

    const additionalAppointmentsQuery = `
      select 
        a.id appointmentId,
        t.text,
        t.id taskId
      from ${DatabaseTable.TSK_APPOINTMENTS} a
      join tsk_relations r 
        on r.mainTaskId = ${lastAppointmentResult.taskId}
        and r.relatedTaskId = a.taskId
        and r.relationType = ${TaskRelationType.ADDITIONAL}
      join ${DatabaseTable.TSK_TASKS} t 
        on t.id = a.taskId
      where a.isAdditional = 1
        and a.statusId = ${Status.APPOINTED}`;

    const [additionalTasks] = await this.mysqlConnection.query(
      additionalAppointmentsQuery,
    );

    return {
      taskId: lastAppointmentResult.taskId,
      appointmentId: lastAppointmentResult.appointmentId,
      text: lastAppointmentResult.text,
      additionalTasks,
    };
  }

  private async appointNextTask(
    nextTask: INextTask,
  ): Promise<AppointedTaskDto> {
    if (nextTask.id) {
      nextTask = await this.getFirstAvailableNextTask(nextTask);
    }

    if (nextTask.id) {
      if (nextTask.timeBreak > 0) {
        const appointedTask = await this.insertAppointment(
          nextTask.id,
          Status.POSTPONED,
          nextTask.timeBreak,
        );

        return appointedTask;
      }

      // выбор задания на время в цепочке, если оно есть
      const timeTask = await this.getChainTimeTask(nextTask.id);
      let timeCheckQuery: string;

      // проверка, достаточно ли времени до ближайшего задания на время
      if (timeTask.id && !timeTask.isFirstTaskInChain) {
        timeCheckQuery = `
          select 
            timestamp(
              date('${this.currentDate}'), 
              time('${this.currentTime}')
            ) + interval (
              select duration 
              from ${DatabaseTable.TSK_TASKS} 
              where id = ${nextTask.id}
            ) minute 
            < timestamp((
                select date(startDate) 
                from ${DatabaseTable.TSK_APPOINTMENTS} 
                where taskId = (
                  select id 
                  from ${DatabaseTable.TSK_TASKS} 
                  where nextTaskId = ${nextTask.id}
                )
                order by id desc
                limit 1
              ), 
              p.startTime
            ) or 0 = ${Number(timeTask.isImportant)} isEnoughTime,
            p.taskId nearestTaskId
          from ${DatabaseTable.TSK_TASKS} t
          join ${DatabaseTable.TSK_PERIODS} p 
            on p.taskId = t.id 
          where t.id = ${timeTask.id}
        `;
      } else {
        const timeTaskStartTimeSqlFilter = timeTask.startTime
          ? `and p.startTime > time('${timeTask.startTime}')`
          : '';
        timeCheckQuery = `
          select 
            timestampdiff(
              minute, 
              time('${this.currentTime}'), 
              p.startTime + interval(
                select 
                  case 
                    when t.isImportant = 1 
                    then -1 
                    else 1 
                  end * ifnull(offset, 0) from ${DatabaseTable.TSK_TASKS} t where t.id = p.taskId
              ) minute
            ) > t.duration 
            or t.duration is null isEnoughTime,
            p.taskId nearestTaskId
          from ${DatabaseTable.TSK_PERIODS} p
          join ${DatabaseTable.TSK_TASKS} t 
            on t.id = ${nextTask.id}
          join ${DatabaseTable.TSK_TASKS} tp 
            on tp.id = p.taskId
            and tp.isDeleted = 0
            and tp.isActive = 1
          where p.startTime > time('${this.currentTime}')
            ${timeTaskStartTimeSqlFilter}
            and (p.date is null or p.date = '${this.currentDate}')
            and (p.month is null or p.month = month('${this.currentDate}'))
            and (p.day is null or p.day = day('${this.currentDate}'))
            and (p.weekday is null or p.weekday = weekday('${this.currentDate}') + 1)
          order by p.startTime asc 
          limit 1`;
      }

      const [[timeCheckResult]] = await this.mysqlConnection.query(
        timeCheckQuery,
      );

      let isCommonChain = false;
      let isEnoughTime = !!timeCheckResult?.isEnoughTime;

      if (timeCheckResult) {
        isCommonChain = await this.checkChainBelonging(
          timeCheckResult?.nearestTaskId,
          nextTask.id,
        );

        if (isCommonChain && !isEnoughTime) {
          nextTask.id = timeCheckResult?.nearestTaskId;
        }
      } else {
        isEnoughTime = true;
      }

      const isPeriodCompleted = await this.checkPeriodCompletion(nextTask.id);

      if (isPeriodCompleted) {
        const nextTaskQuery = `select nextTaskId, nextTaskBreak
            from ${DatabaseTable.TSK_TASKS}
            where id = ${nextTask.id}`;

        [[nextTask]] = await this.mysqlConnection.query(nextTaskQuery);

        this.appointNextTask(nextTask);
      } else if (isEnoughTime || isCommonChain) {
        const appointedTask = await this.insertAppointment(
          nextTask.id,
          Status.APPOINTED,
        );

        const additionalTasks = await this.appointAdditionalTasks(nextTask.id);

        if (additionalTasks?.length > 0) {
          appointedTask.additionalTasks = additionalTasks;
        }

        return appointedTask;
      }
    }
  }

  private async appointAdditionalTasks(
    mainTaskId: number,
  ): Promise<AppointedTaskDto[]> {
    const additionalTasks = await this.getAdditionalTasks(mainTaskId);

    if (this.testMode === true) {
      return additionalTasks.map((task) => ({
        taskId: task.taskId,
        text: task.text,
      }));
    } else {
      const insertData = additionalTasks
        .filter(
          (additionalTask) => additionalTask.statusId !== Status.POSTPONED,
        )
        .map(
          (additionalTask) =>
            `(now(), ${Status.APPOINTED}, ${additionalTask.taskId}, 1)`,
        )
        .join(',');

      const updateData = additionalTasks
        .filter(
          (additionalTask) => additionalTask.statusId === Status.POSTPONED,
        )
        .map((additionalTask) => additionalTask.taskId)
        .join(',');

      const result = [];

      if (insertData) {
        const insertQuery = `insert into ${DatabaseTable.TSK_APPOINTMENTS}
        (startDate, statusId, taskId, isAdditional)
        values 
        ${insertData}`;

        const [insertResult]: [ResultSetHeader] =
          await this.mysqlConnection.query(insertQuery);

        const insertAppointmentsId = new Array(insertResult.affectedRows)
          .fill(insertResult.insertId)
          .map((item, index) => item + index);

        result.push(...(await this.getAppointedTasks(insertAppointmentsId)));
      }

      if (updateData) {
        const selectIdToUpdateQuery = `select id 
          from ${DatabaseTable.TSK_APPOINTMENTS}
          where taskId in (${updateData})
            and statusId = ${Status.POSTPONED}`;

        const [selectIdToUpdateResult] = await this.mysqlConnection.query(
          selectIdToUpdateQuery,
        );

        const updateAppointmentsId = selectIdToUpdateResult.map(
          (result: { id: number }) => result.id,
        );

        const updateQuery = `update ${DatabaseTable.TSK_APPOINTMENTS}
          set statusId = ${Status.APPOINTED}, 
            isAdditional = 1, 
            startDate = now()
          where id in (${updateAppointmentsId.join(',')})`;

        await this.mysqlConnection.query(updateQuery);

        result.push(...(await this.getAppointedTasks(updateAppointmentsId)));
      }

      return result;
    }
  }

  private async appointTimeTask(
    timeTask: ITimeTask,
  ): Promise<AppointedTaskDto> {
    if (timeTask.startTime && timeTask.canBeAppointed && timeTask.taskId) {
      const appointedTask = await this.insertAppointment(
        timeTask.taskId,
        Status.APPOINTED,
      );

      const additionalTasks = await this.appointAdditionalTasks(
        timeTask.taskId,
      );

      if (additionalTasks?.length > 0) {
        appointedTask.additionalTasks = additionalTasks;
      }

      return appointedTask;
    }
  }

  private async getTimeTaskSql(): Promise<ITimeTask> {
    const timeTaskQuery = `
      select 
        time('${this.currentTime}') > p.startTime - interval t.offset minute 
        and time('${this.currentTime}') < ifnull(p.endTime, p.startTime) + interval t.offset minute
        and p.startTime < ifnull(p.endTime, p.startTime + interval t.offset minute)
        or (
          time('${this.currentTime}') > p.startTime - interval t.offset minute 
          and time('${this.currentTime}') < time('23:59:59')
          and time('${this.currentTime}') > time('12:00:00')
          or time('${this.currentTime}') < ifnull(p.endTime, p.startTime) + interval t.offset minute 
          and time('${this.currentTime}') > time('00:00:00')
          and time('${this.currentTime}') < time('12:00:00')
        ) and p.startTime > ifnull(p.endTime, p.startTime + interval t.offset minute) canBeAppointed,
        t.id taskId,
        p.startTime startTime,
        p.endTime endTime,
        exists(select * from ${DatabaseTable.TSK_TASKS} where nextTaskId = t.id) isInChain,
        t.offset offset
      from ${DatabaseTable.TSK_PERIODS} p
      join ${DatabaseTable.TSK_TASKS} t 
        on t.id = p.taskId
      left join ${DatabaseTable.TSK_APPOINTMENTS} a 
        on a.taskId = t.id 
        and (
          (
            p.startTime < p.endTime 
            and a.startDate < timestamp('${this.currentDate}', p.endTime) + interval t.offset minute
            or p.endTime is null
          )
          and a.startDate > timestamp('${this.currentDate}', p.startTime) - interval t.offset minute 
          or 
          p.startTime > p.endTime 
          and (
            a.startDate > timestamp('${this.currentDate}', p.startTime) - interval t.offset minute 
            and a.startDate < timestamp('${this.currentDate}', '23:59:59')
            and time('${this.currentTime}') < time('23:59:59') 
            and time('${this.currentTime}') > time('12:00:00')
            or a.startDate < timestamp('${this.currentDate}', p.endTime) + interval t.offset minute
            and a.startDate > timestamp('${this.currentDate}', '00:00:00')
            and time('${this.currentTime}') > time('00:00:00')
            and time('${this.currentTime}') < time('12:00:00')
          )
        )
      where (
        ifnull(p.endTime, p.startTime) + interval t.offset minute > time('${this.currentTime}') 
        and p.startTime < ifnull(p.endTime, p.startTime + interval t.offset minute)
        or (
          p.startTime > time('${this.currentTime}') - interval t.offset minute 
          and time('${this.currentTime}') < time ('23:59:59') 
          and time('${this.currentTime}') > time ('12:00:00')
          or ifnull(p.endTime, p.startTime) + interval t.offset minute > time('${this.currentTime}')
          and time('${this.currentTime}') > time ('00:00:00') 
          and time('${this.currentTime}') < time ('12:00:00')
        ) and p.startTime > ifnull(p.endTime, p.startTime + interval t.offset minute))
        and (p.date is null or p.date = '${this.currentDate}') 
        and (p.month is null or p.month = month('${this.currentDate}')) 
        and (p.day is null or p.day = day('${this.currentDate}'))  
        and (p.weekday is null or p.weekday = weekday('${this.currentDate}') + 1)
        and a.id is null 
        and t.isActive = 1
        and t.isDeleted = 0
        and (date('${this.currentDate}') < t.endDate or t.endDate is null)
      order by canBeAppointed desc, p.startTime asc 
      limit 1
    `;

    const [[timeTask]] = await this.mysqlConnection.query(timeTaskQuery);

    return CommonHelper.convertToBooleanProperties<ITimeTask>(timeTask, [
      'canBeAppointed',
      'isInChain',
    ]);
  }

  private async getNearestTaskFromChain(
    timeTask: ITimeTask,
  ): Promise<ITimeTask> {
    const periodCountSql = this.getPeriodCountSql();
    const appointmentCountSql = this.getAppointmentCountSql([
      Status.COMPLETED,
      Status.POSTPONED,
      Status.REJECTED,
    ]);

    const timeTaskInChainQuery = `
      select 
        time('${this.currentTime}') > (time('${timeTask.startTime}') - interval sum(t3.duration) minute) - interval ${timeTask.offset} minute 
        and time('${this.currentTime}') < time('${timeTask.endTime}') + interval ${timeTask.offset} minute
        and time('${timeTask.startTime}') < time('${timeTask.endTime}')
        or (
          time('${this.currentTime}') > (time('${timeTask.startTime}') - interval sum(t3.duration) minute) - interval 30 minute 
          and time('${this.currentTime}') < time('23:59:59')
          and time('${this.currentTime}') > time('12:00:00')
          or time('${this.currentTime}') < time('${timeTask.endTime}') + interval 30 minute
          and time('${this.currentTime}') > time('00:00:00')
          and time('${this.currentTime}') < time('12:00:00')
        ) and time('${timeTask.startTime}') > time('${timeTask.endTime}') canBeAppointed,
        t3.id taskId, 
        time('${timeTask.startTime}') - interval sum(t3.duration) minute startTime
      from (
        select 
          t1.lvl, 
          t2.id, 
          t2.nextTaskId, 
          t2.duration, 
          t2.offset, 
          t2.isDeleted, 
          t2.isActive, 
          t2.endDate
        from (
          select
              @r as _id,
              @l := @l + 1 as lvl,
              (
                select @r := (
                  select id 
                  from ${DatabaseTable.TSK_TASKS} 
                  where nextTaskId = t.id
                ) 
                from ${DatabaseTable.TSK_TASKS} t 
                where id = _id
              ) as nextTaskId
          from
            (select @r := ${timeTask.taskId}, @l := 0) vars,
            ${DatabaseTable.TSK_TASKS} h
          where @r is not null
        ) t1
        join ${DatabaseTable.TSK_TASKS} t2
        on t1._id = t2.id
        left join (
          ${periodCountSql}
        ) pc on pc.taskId = t2.id
        left join (
          ${appointmentCountSql}
        ) ac on pc.taskId = ac.taskId
        where t2.id != ${timeTask.taskId} 
          and t2.isActive = 1 
          and t2.isDeleted = 0
          and (ac.appointmentCount < pc.periodCount or ac.appointmentCount is null)
          and (date('${this.currentDate}') < t2.endDate or t2.endDate is null)
        order by t1.lvl desc
      ) t3
    `;

    const [[nearestTaskFromChain]] = await this.mysqlConnection.query(
      timeTaskInChainQuery,
    );

    return nearestTaskFromChain;
  }

  private async getTimeTask(): Promise<ITimeTask> {
    const timeTask = await this.getTimeTaskSql();

    // если задание на время находится в цепочке, то необходимо найти первое доступное
    // задание в этой цепочке и назначать именно его
    if (timeTask.isInChain) {
      const nearestTaskFromChain = await this.getNearestTaskFromChain(timeTask);

      timeTask.canBeAppointed = nearestTaskFromChain.canBeAppointed;
      timeTask.taskId = nearestTaskFromChain.taskId;
      timeTask.startTime = nearestTaskFromChain.startTime;
    }

    return timeTask;
  }

  private async appointDatedTask(
    nearestTaskStartTime: string,
  ): Promise<AppointedTaskDto> {
    const datedTasksQuery = `
      select 
        t.id
      from ${DatabaseTable.TSK_PERIODS} p
      join ${DatabaseTable.TSK_TASKS} t 
        on p.taskId = t.id
      left join ${DatabaseTable.TSK_APPOINTMENTS} a 
        on a.taskId = t.id 
        and date(a.startDate) = '${this.currentDate}'
      where 
        t.duration < timestampdiff(minute, time('${this.currentTime}'), time('${nearestTaskStartTime}'))
        and not exists (
          select * from ${DatabaseTable.TSK_TASKS} where nextTaskId = t.id
        )
        and t.isDeleted = 0
        and t.isActive = 1
        and (date('${this.currentDate}') < t.endDate or t.endDate is null)
        and (
          p.weekday is not null and weekday('${this.currentDate}') + 1 = p.weekday
          or p.day is not null and p.month is null and day('${this.currentDate}') = p.day
          or p.day is not null and p.month is not null and month('${this.currentDate}') = p.month and day('${this.currentDate}') = p.day
          or p.date is not null and '${this.currentDate}' = p.date
        )
        and a.id is null
        and p.startTime is null
      limit 1
    `;

    const [datedTasksResult] = await this.mysqlConnection.query(
      datedTasksQuery,
    );

    const datedTasksId = this.filterChainedTimeTasks(
      datedTasksResult.map((result: { id: number }) => result.id),
    );

    if (datedTasksId.length > 0) {
      const appointedTask = await this.insertAppointment(
        datedTasksId[0],
        Status.APPOINTED,
      );

      const additionalTasks = await this.appointAdditionalTasks(
        datedTasksId[0],
      );

      if (additionalTasks?.length > 0) {
        appointedTask.additionalTasks = additionalTasks;
      }

      return appointedTask;
    }
  }

  private async appointPostponedTask(
    nearestTaskStartTime: string,
  ): Promise<AppointedTaskDto> {
    const postponedTaskQuery = `select 
      timestampdiff(minute, time('${this.currentTime}'), time('${nearestTaskStartTime}')) > t.duration 
      or t.duration is null canBeAppointed,
      a.id appointmentId,
      t.id taskId
      from ${DatabaseTable.TSK_APPOINTMENTS} a
      join ${DatabaseTable.TSK_TASKS} t
      on t.id = a.taskId 
          and t.isDeleted = 0
          and t.isActive = 1
          and (date('${this.currentDate}') < t.endDate or t.endDate is null)
      where a.statusId = ${Status.POSTPONED}
          and date('${this.currentDate}') > a.startDate
      order by a.startDate asc 
      limit 1`;

    const [[postponedTask]] = await this.mysqlConnection.query(
      postponedTaskQuery,
    );

    if (
      postponedTask?.canBeAppointed &&
      postponedTask?.appointmentId &&
      postponedTask?.taskId
    ) {
      this.appointAdditionalTasks(postponedTask.taskId);

      const updateQuery = `update ${DatabaseTable.TSK_APPOINTMENTS}
        set startDate = now(), statusId = ${Status.APPOINTED}
        where id = ${postponedTask.appointmentId}`;

      await this.mysqlConnection.query(updateQuery);

      const appointedTask = this.getAppointedTask(postponedTask.appointmentId);

      return appointedTask;
    }
  }

  private async appointRandomTask(
    nearestTaskStartTime: string,
  ): Promise<AppointedTaskDto> {
    const periodCountSql = this.getPeriodCountSql();
    const appointmentCountSql = this.getAppointmentCountSql([
      Status.COMPLETED,
      Status.POSTPONED,
      Status.REJECTED,
    ]);
    const randomTasksQuery = `
      select 
        t.id,
        pc.periodCount,
        ac.appointmentCount,
        t.duration,
        a.startDate,
        t.cooldown,
        p.typeId
      from ${DatabaseTable.TSK_TASKS} t
      left join ${DatabaseTable.TSK_APPOINTMENTS} a
      on a.taskId = t.id
      and a.startDate = (
        select startDate
        from ${DatabaseTable.TSK_APPOINTMENTS}
        where taskId = t.id
        and statusId in (${Status.COMPLETED}, ${Status.POSTPONED}, ${Status.REJECTED})
        order by startDate desc
        limit 1)
      join (
        ${periodCountSql}
      ) pc on pc.taskId = t.id
      left join (
        ${appointmentCountSql}
      ) ac on ac.taskId = t.id
      join (
        select
          typeId,
          taskId
        from ${DatabaseTable.TSK_PERIODS}
        where ((weekday is null or weekday('${this.currentDate}') + 1 = weekday)
          and (day is null or day('${this.currentDate}') = day)
          and (month is null or month('${this.currentDate}') = month)
          and (date is null or '${this.currentDate}' = date))
        group by taskId
      ) p on p.taskId = t.id
      where (ac.appointmentCount < pc.periodCount or ac.appointmentCount is null)
        and t.duration < timestampdiff(minute, time('${this.currentTime}'), time('${nearestTaskStartTime}'))
        and not exists (
            select * from ${DatabaseTable.TSK_TASKS} where nextTaskId = t.id
        )
        and t.isActive = 1
        and t.isDeleted = 0
        and (date(${this.currentDate}) < t.endDate or t.endDate is null)
        and (
          date_format(a.startDate, '%Y-%m-%d %H:00') + interval t.cooldown hour 
            < timestamp(date('${this.currentDate}'), time('${this.currentTime}')) 
            and p.typeId = ${TaskPeriodType.DAILY}
          or date_format(a.startDate, '%Y-%m-%d 00:00') + interval t.cooldown day < date('${this.currentDate}') 
            and p.typeId = ${TaskPeriodType.WEEKLY}
          or date_format(a.startDate, '%Y-%m-%d 00:00') + interval t.cooldown week < date('${this.currentDate}') 
            and p.typeId = ${TaskPeriodType.MONTHLY}
          or date_format(a.startDate, '%Y-%m-01 00:00') + interval t.cooldown month < date('${this.currentDate}') 
            and p.typeId = ${TaskPeriodType.YEARLY}
          or a.startDate is null
          or p.typeId = ${TaskPeriodType.ONCE}
          or t.cooldown = 0)
        and t.id not in (
            select 
              r.relatedTaskId
            from tsk_relations r
            left join ${DatabaseTable.TSK_APPOINTMENTS} a2
              on a2.taskId = r.mainTaskId
              and r.relationType = ${TaskRelationType.EXCLUDED}
              and date(a2.startDate) = '${this.currentDate}'
            where a2.id is not null
        )`;

    let [randomTasksArray] = await this.mysqlConnection.query(randomTasksQuery);

    randomTasksArray = this.filterChainedTimeTasks(
      randomTasksArray.map((task) => task.id),
    );

    if (randomTasksArray.length) {
      const randomTaskId =
        randomTasksArray[Math.floor(Math.random() * randomTasksArray.length)];

      this.appointAdditionalTasks(randomTaskId);

      const appointedTask = await this.insertAppointment(
        randomTaskId,
        Status.APPOINTED,
      );

      const additionalTasks = await this.appointAdditionalTasks(randomTaskId);

      if (additionalTasks?.length > 0) {
        appointedTask.additionalTasks = additionalTasks;
      }

      return appointedTask;
    }
  }

  private getPeriodCountSql(): string {
    return `select p.taskId, count(*) periodCount
        from ${DatabaseTable.TSK_PERIODS} p
        where p.startTime is null
        group by p.taskId`;
  }

  private getAppointmentCountSql(statuses: number[]): string {
    return `select a.taskId, count(*) appointmentCount
        from ${DatabaseTable.TSK_APPOINTMENTS} a
        join (
            select p.typeId, p.taskId, count(*)
            from ${DatabaseTable.TSK_PERIODS} p
            group by p.typeId, p.taskId
        ) pt on pt.taskId = a.taskId
        where a.statusId in (${statuses.join(', ')})
          and (date(a.startDate) = '${this.currentDate}' 
          and pt.typeId = ${TaskPeriodType.DAILY}
        or 
          week(a.startDate, 1) = week('${this.currentDate}', 1) 
          and pt.typeId = ${TaskPeriodType.WEEKLY}
        or 
          month(a.startDate) = month('${this.currentDate}') 
          and pt.typeId = ${TaskPeriodType.MONTHLY}
        or 
          year(a.startDate) = year('${this.currentDate}') 
          and pt.typeId = ${TaskPeriodType.YEARLY}
        or 
          pt.typeId = ${TaskPeriodType.ONCE})
        group by a.taskId`;
  }

  private async getFirstAvailableNextTask(
    nextTask: INextTask,
  ): Promise<INextTask> {
    let isTaskAvailable: boolean;

    do {
      const taskQuery = `
        select 
          isDeleted, 
          isActive, 
          endDate, 
          nextTaskId,
          (
            select nextTaskBreak 
            from ${DatabaseTable.TSK_TASKS} 
            where nextTaskId = ${nextTask.id}
          ) timeBreak
        from ${DatabaseTable.TSK_TASKS} 
        where id = ${nextTask.id}
      `;

      const [[taskQueryResult]] = await this.mysqlConnection.query(taskQuery);
      const isActual =
        !taskQueryResult.endDate ||
        new Date(taskQueryResult.endDate).valueOf() <=
          new Date(`${this.currentDate} ${this.currentTime}`).valueOf();
      isTaskAvailable =
        !taskQueryResult.isDeleted && taskQueryResult.isActive && isActual;

      if (!isTaskAvailable) {
        nextTask.id = taskQueryResult.nextTaskId;
        nextTask.timeBreak = taskQueryResult.timeBreak;
      }
    } while (!isTaskAvailable && nextTask.id);

    return nextTask;
  }

  private async getChainTimeTask(taskId: number): Promise<{
    id: number;
    startTime: string;
    isImportant: boolean;
    isFirstTaskInChain: boolean;
  }> {
    // поиск задания на время с начала цепочки
    const timeTaskStartQuery = `
      select 
        t2.id id, 
        p.startTime startTime, 
        t2.isImportant isImportant
      from (
          select
              @r as _id,
              @l := @l + 1 as lvl,
              (
                select @r := (
                  select id 
                  from ${DatabaseTable.TSK_TASKS} 
                  where id = t.nextTaskId
                ) 
                from ${DatabaseTable.TSK_TASKS} t 
                where id = _id
              ) as nextTaskId
          from
              (select @r := ${taskId}, @l := 0) vars,
              ${DatabaseTable.TSK_TASKS} h
          where @r is not null
          ) t1
      join ${DatabaseTable.TSK_TASKS} t2
        on t1._id = t2.id
      join ${DatabaseTable.TSK_PERIODS} p
        on p.taskId = t2.id 
      where p.startTime is not null`;

    let [[timeTask]] = await this.mysqlConnection.query(timeTaskStartQuery);
    let isFirstTaskInChain = false;

    // поиск задания на время с конца цепочки, чтобы найти самое первое задание на время
    if (!timeTask?.id) {
      const timeTaskEndQuery = `select 
          t2.id id, 
          p.startTime startTime, 
          t2.isImportant isImportant
        from (
            select
                @r as _id,
                @l := @l + 1 as lvl,
                (
                  select @r := (
                    select id 
                    from ${DatabaseTable.TSK_TASKS} 
                    where nextTaskId = t.id
                  ) 
                  from ${DatabaseTable.TSK_TASKS} t 
                  where id = _id
                ) as nextTaskId
            from
                (select @r := ${taskId}, @l := 0) vars,
                ${DatabaseTable.TSK_TASKS} h
            where @r is not null
            ) t1
        join ${DatabaseTable.TSK_TASKS} t2
        on t1._id = t2.id
        join ${DatabaseTable.TSK_PERIODS} p
        on p.taskId = t2.id 
        where p.startTime is not null`;

      [[timeTask]] = await this.mysqlConnection.query(timeTaskEndQuery);

      if (timeTask?.id) {
        isFirstTaskInChain = true;
      }
    }

    return {
      ...timeTask,
      isFirstTaskInChain,
    };
  }

  private async checkChainBelonging(
    nearestTaskId: number,
    nextTaskId: number,
  ): Promise<boolean> {
    if (!nearestTaskId || !nextTaskId) {
      return false;
    }

    const chainQuery = `select 
          t2.id
        from (
          select
              @r as _id,
              @l := @l + 1 as lvl,
              (select @r := (
                select id 
                from ${DatabaseTable.TSK_TASKS} 
                where nextTaskId = t.id
              ) from ${DatabaseTable.TSK_TASKS} t where id = _id) as nextTaskId
          from
            (select @r := ${nearestTaskId}, @l := 0) vars,
            ${DatabaseTable.TSK_TASKS} h
          where @r is not null
        ) t1
      join ${DatabaseTable.TSK_TASKS} t2
      on t1._id = t2.id
      where t2.id = ${nextTaskId}`;

    const [[checkResult]] = await this.mysqlConnection.query(chainQuery);

    return !!checkResult?.id;
  }

  private async insertAppointment(
    taskId: number,
    statusId: number,
    timeBreak = 0,
  ): Promise<AppointedTaskDto> {
    if (this.testMode === true) {
      return this.getAppointedTaskTest(taskId);
    } else {
      const startDate =
        'now()' + (timeBreak > 0 ? ` + interval ${timeBreak} hour` : '');

      const insertQuery = `insert into ${DatabaseTable.TSK_APPOINTMENTS}
        (startDate, statusId, taskId)
        values
        (${startDate}, ${statusId}, ${taskId})`;

      const [insertResult]: [ResultSetHeader] =
        await this.mysqlConnection.query(insertQuery);

      return this.getAppointedTask(insertResult.insertId);
    }
  }

  private getCurrentDate(): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = `${currentDate.getMonth() + 1}`.padStart(2, '0');
    const day = `${currentDate.getDate()}`.padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
  }

  private getCurrentTime(): string {
    const currentDateTime = new Date();

    return currentDateTime.toLocaleTimeString();
  }

  private filterChainedTimeTasks(idArray: number[]): number[] {
    return idArray.filter(
      async (item) => !(await this.getChainTimeTask(item)).id,
    );
  }

  private async checkPeriodCompletion(nextTaskId: number): Promise<boolean> {
    const periodCheckQuery = `select 
        pc.periodCount <= coalesce(ac.appointmentCount, 0) isPeriodCompleted
      from (
          select p.taskId, count(*) periodCount
          from ${DatabaseTable.TSK_PERIODS} p
          where p.taskId = ${nextTaskId}
          group by p.taskId
      ) pc left join (
          select a.taskId, count(*) appointmentCount
          from ${DatabaseTable.TSK_APPOINTMENTS} a
          join (
              select p.typeId, p.taskId
              from ${DatabaseTable.TSK_PERIODS} p
              where p.taskId = ${nextTaskId}
              limit 1
          ) pt on pt.taskId = a.taskId
          where (date(a.startDate) = '${this.currentDate}' and pt.typeId = ${TaskPeriodType.DAILY})
              or (week(a.startDate) = week('${this.currentDate}') and pt.typeId = ${TaskPeriodType.WEEKLY})
              or (month(a.startDate) = month('${this.currentDate}') and pt.typeId = ${TaskPeriodType.MONTHLY})
              or (year(a.startDate) = year('${this.currentDate}') and pt.typeId = ${TaskPeriodType.YEARLY})
              or pt.typeId = ${TaskPeriodType.ONCE}
          group by a.taskId
      ) ac on pc.taskId = ac.taskId`;

    const [[{ isPeriodCompleted }]] = await this.mysqlConnection.query(
      periodCheckQuery,
    );

    return !!isPeriodCompleted;
  }

  private async getAppointedTask(
    appointmentId: number,
  ): Promise<AppointedTaskDto> {
    const appointedTaskQuery = `
      select 
        a.id appointmentId,
        t.id taskId,
        t.text
      from ${DatabaseTable.TSK_APPOINTMENTS} a
      join ${DatabaseTable.TSK_TASKS} t on t.id = a.taskId
      where a.id = ${appointmentId}`;

    const [[appointedTask]] = await this.mysqlConnection.query(
      appointedTaskQuery,
    );

    return appointedTask;
  }

  private async getAppointedTaskTest(
    taskId: number,
  ): Promise<AppointedTaskDto> {
    const appointedTaskQuery = `
      select 
        id taskId,
        text
      from ${DatabaseTable.TSK_TASKS}
      where id = ${taskId}`;

    const [[appointedTask]] = await this.mysqlConnection.query(
      appointedTaskQuery,
    );

    return appointedTask;
  }

  private async getAppointedTasks(
    appointmentsId: number[],
  ): Promise<AppointedTaskDto[]> {
    const appointedTaskQuery = `
      select 
          t.id,
          t.text
      from ${DatabaseTable.TSK_APPOINTMENTS} ta
      join ${DatabaseTable.TSK_TASKS} t on t.id = ta.taskId
      where ta.id in (${appointmentsId.join(',')})`;

    const [appointedTasks] = await this.mysqlConnection.query(
      appointedTaskQuery,
    );

    return appointedTasks;
  }

  private async getAdditionalTasks(taskId: number): Promise<IAdditionalTask[]> {
    const periodCountSql = this.getPeriodCountSql();
    const appointmentCountSql = this.getAppointmentCountSql([Status.COMPLETED]);
    const additionalTasksQuery = `
      select 
        r.relatedTaskId taskId,
        a2.statusId statusId,
        a.id is not null or not exists (select id from ${DatabaseTable.TSK_APPOINTMENTS} where taskId = t.id) canBeAppointed, 
        t.text,
        count(*)
      from tsk_relations r
      join ${DatabaseTable.TSK_TASKS} t 
        on t.id = r.relatedTaskId
      join ${DatabaseTable.TSK_PERIODS} p 
        on p.taskId = r.relatedTaskId
      left join ${DatabaseTable.TSK_APPOINTMENTS} a 
        on a.taskId = r.relatedTaskId 
        and (a.statusId in (${Status.COMPLETED}, ${Status.POSTPONED}) or a.statusId is null)
        and (date_format(a.startDate, '%Y-%m-%d %H:00') + interval t.cooldown hour < now() and p.typeId = ${TaskPeriodType.DAILY}
          or date_format(a.startDate, '%Y-%m-%d 00:00') + interval t.cooldown day < date('${this.currentDate}') and p.typeId = ${TaskPeriodType.WEEKLY}
          or date_format(a.startDate, '%Y-%m-%d 00:00') + interval t.cooldown week < date('${this.currentDate}') and p.typeId = ${TaskPeriodType.MONTHLY}
          or date_format(a.startDate, '%Y-%m-01 00:00') + interval t.cooldown month < date('${this.currentDate}') and p.typeId = ${TaskPeriodType.YEARLY}
          or a.startDate is null
          or (a.startDate < date('${this.currentDate}') and a.statusId = ${Status.POSTPONED})
          or p.typeId = ${TaskPeriodType.ONCE}
          or t.cooldown = 0)
        and (a.startDate = (select max(startDate) from ${DatabaseTable.TSK_APPOINTMENTS} where taskId = t.id and statusId in (${Status.COMPLETED}, ${Status.POSTPONED})) 
          or a.startDate is null)
      left join (
        select taskId, statusId, count(*) 
        from ${DatabaseTable.TSK_APPOINTMENTS} 
        group by taskId, statusId
      ) a2 on a2.taskId = r.relatedTaskId
          and a2.statusId in (${Status.COMPLETED}, ${Status.POSTPONED})
      left join (
        ${periodCountSql}
      ) pc on pc.taskId = r.relatedTaskId
      left join (
        ${appointmentCountSql}
      ) ac on ac.taskId = r.relatedTaskId
      where r.mainTaskId = ${taskId}
        and r.relationType = ${TaskRelationType.ADDITIONAL}
        and (ac.appointmentCount < pc.periodCount or ac.appointmentCount is null)
        and t.isActive = 1
        and t.isDeleted = 0
        and (date('${this.currentDate}') < t.endDate or t.endDate is null)
        and (a.statusId in (${Status.COMPLETED}, ${Status.POSTPONED}) or a.statusId is null)
        and (day('${this.currentDate}') in (select day from ${DatabaseTable.TSK_PERIODS} where taskId = t.id) 
          or (select day from ${DatabaseTable.TSK_PERIODS} where taskId = t.id limit 1) is null)
        and p.id = (select id from ${DatabaseTable.TSK_PERIODS} where taskId = t.id limit 1)
      group by r.relatedTaskId`;

    const [additionalTasks] = await this.mysqlConnection.query(
      additionalTasksQuery,
    );

    return additionalTasks.filter(
      (additionalTask: IAdditionalTask) =>
        additionalTask.taskId && additionalTask.canBeAppointed,
    );
  }
}
