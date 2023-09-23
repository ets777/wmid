import { IsString, IsNumber, IsBoolean, Min } from 'class-validator';

export class CommonTaskDto {
  @IsBoolean({ message: 'Должно быть булевым значением' })
  isActive?: boolean;

  @IsNumber(null, { message: 'Должно быть числом' })
  cooldown?: number;

  @IsNumber(null, { message: 'Должно быть числом' })
  nextTaskBreak?: number;

  @IsString({ message: 'Должно быть строкой' })
  endDate?: string;

  @IsNumber(null, { message: 'Должно быть числом' })
  offset?: number;

  @IsBoolean({ message: 'Должно быть булевым значением' })
  isImportant?: boolean;

  @Min(1, { message: 'Должно быть больше нуля' })
  @IsNumber(null, { message: 'Должно быть числом' })
  nextTaskId?: number;
}
