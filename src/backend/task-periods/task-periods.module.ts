import { Module } from '@nestjs/common';
import { TaskPeriodsService } from './task-periods.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from 'roles/roles.model';
import { User } from 'users/users.model';
import { UserRole } from 'roles/user-roles.model';
import { Task } from 'tasks/tasks.model';
import { TaskPeriod } from './task-periods.model';
import { AuthModule } from 'auth/auth.module';

@Module({
  providers: [TaskPeriodsService],
  controllers: [],
  imports: [
    SequelizeModule.forFeature([Role, User, UserRole, Task, TaskPeriod]),
    AuthModule,
  ],
  exports: [TaskPeriodsService],
})
export class TaskPeriodsModule {}
