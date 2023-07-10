import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { CommonTaskDto } from './common-task.dto';
import { CommonTaskPeriodDto } from '@backend/task-periods/dto/common-task-period.dto';
import { TaskPeriodType } from '@backend/task-periods/task-periods.enum';

export class CommonCreateTaskDto extends CommonTaskDto {
  @ApiProperty({
    example: 'Заправить кровать',
    description: 'Текст задания',
  })
  @IsString({ message: 'Должно быть строкой' })
  text: string;

  @ApiProperty({
    example: 20,
    description: 'Продолжительность задания в минутах',
  })
  @IsNumber(null, { message: 'Должно быть числом' })
  duration: number;

  @ApiProperty({
    example: 1,
    description: 'ID категории',
  })
  @IsNumber(null, { message: 'Должно быть числом' })
  categoryId: number;

  @ApiProperty({
    example: [
      {
        typeId: TaskPeriodType.DAILY,
      },
    ],
    description: 'Период',
  })
  periods: CommonTaskPeriodDto[];
}
