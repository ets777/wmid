import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ITaskCategory } from './task-categories.interface';
import { CreateTaskCategoryDto } from './dto/create-task-category.dto';
import { UpdateTaskCategoryDto } from './dto/update-task-category.dto';
import { DB_CONNECTION } from '@backend/database/database.module';
import { ResultSetHeader } from 'mysql2';
import { DatabaseHelper } from '@backend/database/database.helper';
import { DatabaseTable } from '@backend/database/database.enum';
import { CommonHelper } from '@backend/library/common.helper';

@Injectable()
export class TaskCategoriesService {
  constructor(@Inject(DB_CONNECTION) private mysqlConnection: any) {}

  async createTaskCategory(
    createTaskCategoryDto: CreateTaskCategoryDto,
  ): Promise<number> {
    const fields = ['code', 'name'];

    const [result]: [ResultSetHeader] = await this.mysqlConnection.query(
      DatabaseHelper.getSqlInsert(
        DatabaseTable.TSK_CATEGORIES,
        CommonHelper.filterObjectProperties(
          {
            ...createTaskCategoryDto,
            code: createTaskCategoryDto.code.toUpperCase(),
          },
          fields,
        ),
      ),
    );

    return result.affectedRows;
  }

  async deleteTaskCategory(code: string): Promise<number> {
    const [result]: [ResultSetHeader] = await this.mysqlConnection.query(`
      delete from ${DatabaseTable.TSK_CATEGORIES} 
      where code = '${code.toUpperCase()}'
    `);

    return result.affectedRows;
  }

  async getTaskCategoryByCode(code: string): Promise<ITaskCategory> {
    const [[taskCategory]]: [[ITaskCategory]] = await this.mysqlConnection
      .query(`
        select 
          id,
          code,
          name
        from ${DatabaseTable.TSK_CATEGORIES}
        where code = ${code.toUpperCase}
      `);

    return taskCategory;
  }

  async getAllTaskCategories(): Promise<ITaskCategory[]> {
    const [taskCategories]: [ITaskCategory[]] = await this.mysqlConnection
      .query(`
        select 
          id,
          code,
          name
        from ${DatabaseTable.TSK_CATEGORIES}
      `);

    return taskCategories;
  }

  async updateTaskCategory(
    code: string,
    data: UpdateTaskCategoryDto,
  ): Promise<number> {
    const taskCategory = await this.getTaskCategoryByCode(code);

    if (!taskCategory) {
      throw new HttpException('Категория не найдена', HttpStatus.NOT_FOUND);
    }

    const filteredData = CommonHelper.filterObjectProperties(data, ['name']);

    const [updateResult]: [ResultSetHeader] = await this.mysqlConnection.query(
      DatabaseHelper.getSqlUpdate(DatabaseTable.TSK_CATEGORIES, filteredData, {
        id: taskCategory.id,
      }),
    );

    return updateResult.affectedRows;
  }
}
