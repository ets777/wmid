import { Module } from '@nestjs/common';
import { TaskCategoriesService } from './task-categories.service';
import { TaskCategoriesController } from './task-categories.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from 'roles/roles.model';
import { User } from 'users/users.model';
import { UserRole } from 'roles/user-roles.model';
import { Task } from 'tasks/tasks.model';
import { TaskCategory } from './task-categories.model';
import { AuthModule } from 'auth/auth.module';

@Module({
  providers: [TaskCategoriesService],
  controllers: [TaskCategoriesController],
  imports: [
    SequelizeModule.forFeature([Role, User, UserRole, Task, TaskCategory]),
    AuthModule,
  ],
  exports: [],
})
export class TaskCategoriesModule {}
