import { ApiProperty } from '@nestjs/swagger';
import { CommonTaskDto } from './common-task.dto';
import { IsNumber, IsString } from 'class-validator';

export class UpdateTaskDto extends CommonTaskDto {
  @ApiProperty({
    example: 'Заправить кровать',
    description: 'Текст задания',
  })
  @IsString({ message: 'Должно быть строкой' })
  text?: string;

  @ApiProperty({
    example: 20,
    description: 'Продолжительность задания в минутах',
  })
  @IsNumber(null, { message: 'Должно быть числом' })
  duration?: number;

  @ApiProperty({
    example: 1,
    description: 'ID категории',
  })
  @IsNumber(null, { message: 'Должно быть числом' })
  categoryId?: number;
}
