import { IsNumber, IsString } from 'class-validator';
import { CommonTaskDto } from './common-task.dto';
import { CommonTaskPeriodDto } from '@backend/task-periods/dto/common-task-period.dto';

export class CommonCreateTaskDto extends CommonTaskDto {
  @IsString({ message: 'Должно быть строкой' })
  text: string;

  @IsNumber(null, { message: 'Должно быть числом' })
  duration: number;

  @IsNumber(null, { message: 'Должно быть числом' })
  categoryId: number;

  periods: CommonTaskPeriodDto[];
}
