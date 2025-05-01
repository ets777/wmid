import { IsNumber, IsString } from 'class-validator';
import { Status } from '@backend/task-appointments/task-appointments.enum';

export class CommonTaskAppointmentDto {
    @IsNumber(null, { message: 'Must be a number' })
    public statusId: Status;

    @IsString({ message: 'Must be a string' })
    public startDate?: string;

    @IsString({ message: 'Must be a string' })
    public endDate?: string;
}
