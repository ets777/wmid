import { Module } from '@nestjs/common';
import { TaskPeriodsService } from './task-periods.service';
import { AuthModule } from '@backend/auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from '@backend/roles/roles.model';
import { User } from '@backend/users/users.model';
import { UserRole } from '@backend/roles/user-roles.model';
import { TaskPeriod } from './task-periods.model';
import { Task } from '@backend/tasks/tasks.model';
import { DateTimeService } from '@backend/services/date-time.service';
import { TaskAppointmentModule } from '@backend/task-appointments/task-appointments.module';
import { TaskPeriodsFilterService } from '@backend/filters/task-periods/task-periods.filter';
import { IncludeService } from '@backend/services/include.service';

@Module({
    providers: [
        TaskPeriodsService, 
        DateTimeService, 
        TaskPeriodsFilterService,
        IncludeService,
    ],
    controllers: [],
    imports: [
        SequelizeModule.forFeature([Role, User, UserRole, Task, TaskPeriod]),
        AuthModule,
        TaskAppointmentModule,
    ],
    exports: [TaskPeriodsService],
})
export class TaskPeriodsModule { }
