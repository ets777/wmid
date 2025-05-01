import { IsBoolean, IsNumber } from 'class-validator';
import { CommonTaskAppointmentDto } from './common-task-appointment.dto';

export class CreateTaskAppointmentDto extends CommonTaskAppointmentDto {
    @IsNumber(null, { message: 'Must be a number' })
    public taskPeriodId: number;

    @IsBoolean({ message: 'Must be boolean' })
    public isAdditional?: boolean;
}
