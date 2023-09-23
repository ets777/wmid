import { IsNumber, IsString } from 'class-validator';
import { Status } from '../task-appointments.enum';

export class CommonTaskAppointmentDto {
  @IsNumber(null, { message: 'Должно быть числом' })
  statusId: Status;

  @IsString({ message: 'Должно быть строкой' })
  startDate?: string;

  @IsString({ message: 'Должно быть строкой' })
  endDate?: string;
}
