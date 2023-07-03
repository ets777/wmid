import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { Month, TaskPeriodType, Weekday } from 'task-periods/task-periods.enum';

export class CommonTaskPeriodDto {
  @ApiProperty({
    example: 1,
    description: 'ID типа периода',
  })
  @IsNumber(null, { message: 'Должно быть числом' })
  typeId: TaskPeriodType;

  @ApiProperty({
    example: '07:58:00',
    description: 'Время начала действия периода',
  })
  @IsString({ message: 'Должно быть строкой' })
  startTime?: string;

  @ApiProperty({
    example: '17:58:00',
    description: 'Время окончания действия периода',
  })
  @IsString({ message: 'Должно быть строкой' })
  endTime?: string;

  @ApiProperty({
    example: 1,
    description: 'День недели действия периода',
  })
  @IsNumber(null, { message: 'Должно быть числом' })
  weekday?: Weekday;

  @ApiProperty({
    example: 1,
    description: 'День месяца действия периода',
  })
  @IsNumber(null, { message: 'Должно быть числом' })
  day?: number;

  @ApiProperty({
    example: 1,
    description: 'Месяц действия периода',
  })
  @IsNumber(null, { message: 'Должно быть числом' })
  month?: Month;

  @ApiProperty({
    example: '2024-10-28',
    description: 'Дата действия периода',
  })
  @IsString({ message: 'Должно быть строкой' })
  date?: string;
}
