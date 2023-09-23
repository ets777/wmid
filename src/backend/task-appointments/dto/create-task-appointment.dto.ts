import { IsBoolean, IsNumber } from 'class-validator';
import { CommonTaskAppointmentDto } from './common-task-appointment.dto';

export class CreateTaskAppointmentDto extends CommonTaskAppointmentDto {
  @IsNumber(null, { message: 'Должно быть числом' })
  taskId: number;

  @IsBoolean({ message: 'Должно быть булевым значением' })
  isAdditional?: boolean;
}
