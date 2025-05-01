import { Module } from '@nestjs/common';
import { TaskAppointmentsService } from './task-appointments.service';
import { AuthModule } from 'auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from '@backend/roles/roles.model';
import { User } from '@backend/users/users.model';
import { UserRole } from '@backend/roles/user-roles.model';
import { Task } from '@backend/tasks/tasks.model';
import { TaskPeriod } from '@backend/task-periods/task-periods.model';
import { TaskAppointment } from './task-appointments.model';
import { DateTimeService } from '@backend/services/date-time.service';
import { TaskLoggerService } from '@backend/services/task-logger.service';

@Module({
    providers: [
        TaskAppointmentsService, 
        DateTimeService, 
        TaskLoggerService, 
    ],
    controllers: [],
    imports: [
        SequelizeModule.forFeature([
            Role, 
            User, 
            UserRole, 
            Task, 
            TaskPeriod, 
            TaskAppointment, 
            TaskPeriod,
        ]),
        AuthModule,
    ],
    exports: [TaskAppointmentsService],
})
export class TaskAppointmentModule { }
