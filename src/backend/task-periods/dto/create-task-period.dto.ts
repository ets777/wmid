import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { CommonTaskPeriodDto } from './common-task-period.dto';

export class CreateTaskPeriodDto extends CommonTaskPeriodDto {
  @ApiProperty({
    example: 1,
    description: 'ID задания',
  })
  @IsNumber(null, { message: 'Должно быть числом' })
  taskId: number;
}
