import { IsNumber, IsString } from 'class-validator';
import { Status } from '../task-appointments.enum';

export class CommonTaskAppointmentDto {
  @IsNumber(null, { message: 'Must be a number' })
  statusId: Status;

  @IsString({ message: 'Must be a string' })
  startDate?: string;

  @IsString({ message: 'Must be a string' })
  endDate?: string;
}
