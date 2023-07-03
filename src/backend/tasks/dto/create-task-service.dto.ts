import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { CommonCreateTaskDto } from './common-create-task.dto';

export class CreateTaskServiceDto extends CommonCreateTaskDto {
  @ApiProperty({
    example: 1,
    description: 'ID автора',
  })
  @IsNumber(null, { message: 'Должно быть числом' })
  userId: number;
}
