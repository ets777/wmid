import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AuthModule } from 'auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from 'roles/roles.model';
import { User } from 'users/users.model';
import { UserRole } from 'roles/user-roles.model';
import { Task } from './tasks.model';
import { TaskCategory } from 'task-categories/task-categories.model';
import { TaskPeriodsModule } from 'task-periods/task-periods.module';

@Module({
  providers: [TasksService],
  controllers: [TasksController],
  imports: [
    SequelizeModule.forFeature([Role, User, UserRole, Task, TaskCategory]),
    AuthModule,
    TaskPeriodsModule,
  ],
  exports: [],
})
export class TasksModule {}
