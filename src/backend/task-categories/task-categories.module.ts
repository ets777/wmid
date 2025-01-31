import { Module } from '@nestjs/common';
import { TaskCategoriesService } from './task-categories.service';
import { TaskCategoriesController } from './task-categories.controller';
import { AuthModule } from 'auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from '@backend/roles/roles.model';
import { User } from '@backend/users/users.model';
import { UserRole } from '@backend/roles/user-roles.model';
import { TaskCategory } from './task-categories.model';
import { Task } from '@backend/tasks/tasks.model';

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
