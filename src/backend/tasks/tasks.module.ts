import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AuthModule } from 'auth/auth.module';
import { TaskPeriodsModule } from '@backend/task-periods/task-periods.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from '@backend/roles/roles.model';
import { User } from '@backend/users/users.model';
import { UserRole } from '@backend/roles/user-roles.model';
import { Task } from './tasks.model';
import { TaskCategory } from '@backend/task-categories/task-categories.model';
import { TaskAppointmentModule } from '@backend/task-appointments/task-appointments.module';
import { DateTimeService } from '@backend/services/date-time.service';
import { TaskRelationsModule } from '@backend/task-relations/task-relations.module';
import { IncludeService } from '@backend/services/include.service';
import { TaskPeriodsFilterService } from '@backend/filters/task-periods/task-periods.filter';
import { TasksFilterService } from '@backend/filters/tasks/task.filter';
import { TaskLoggerService } from '@backend/services/task-logger.service';
import { SessionModule } from '@backend/session/session.module';

@Module({
    providers: [
        TasksService, 
        DateTimeService, 
        IncludeService, 
        TaskPeriodsFilterService,
        TasksFilterService,
        TaskLoggerService,
    ],
    controllers: [TasksController],
    imports: [
        SequelizeModule.forFeature([
            Role, 
            User, 
            UserRole, 
            Task, 
            TaskCategory,
        ]),
        AuthModule,
        TaskPeriodsModule,
        TaskAppointmentModule,
        TaskRelationsModule,
        SessionModule,
    ],
    exports: [],
})
export class TasksModule { }
