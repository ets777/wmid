import { CommonTaskDto } from './common-task.dto';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class UpdateTaskDto extends CommonTaskDto {
  @IsString({ message: 'Должно быть строкой' })
  text?: string;

  @IsNumber(null, { message: 'Должно быть числом' })
  duration?: number;

  @IsNumber(null, { message: 'Должно быть числом' })
  categoryId?: number;

  @IsBoolean({ message: 'Должно быть булевым значением' })
  isDeleted?: boolean;
}
