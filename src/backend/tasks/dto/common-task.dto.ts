import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, Min } from 'class-validator';

export class CommonTaskDto {
  @ApiProperty({
    example: true,
    description: 'Флаг активности',
  })
  @IsBoolean({ message: 'Должно быть булевым значением' })
  active?: boolean;

  @ApiProperty({
    example: 2,
    description:
      'Перерыв до следующего назначения. Единицы зависят от периодичности задания',
  })
  @IsNumber(null, { message: 'Должно быть числом' })
  cooldown?: number;

  @ApiProperty({
    example: 10,
    description: 'Перерыв до следующего задания в минутах',
  })
  @IsNumber(null, { message: 'Должно быть числом' })
  nextTaskBreak?: number;

  @ApiProperty({
    example: '2050-01-01',
    description: 'Дата, до которой задание будет активно',
  })
  @IsString({ message: 'Должно быть строкой' })
  endDate?: string;

  @ApiProperty({
    example: 15,
    description: 'Смещение начала задания в минутах',
  })
  @IsNumber(null, { message: 'Должно быть числом' })
  offset?: number;

  @ApiProperty({
    example: false,
    description: 'Флаг важности',
  })
  @IsBoolean({ message: 'Должно быть булевым значением' })
  important?: boolean;

  @ApiProperty({
    example: 1,
    description: 'ID следующего задания',
  })
  @Min(1, { message: 'Должно быть больше нуля' })
  @IsNumber(null, { message: 'Должно быть числом' })
  nextTaskId?: number;
}
