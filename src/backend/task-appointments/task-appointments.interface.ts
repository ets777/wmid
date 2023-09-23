import { Status } from './task-appointments.enum';

export class ITaskAppointment {
  statusId?: Status;
  taskId?: number;
  startDate?: string;
  endDate?: string;
  isAdditional?: boolean;
}
