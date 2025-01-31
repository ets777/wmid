import { Module } from '@nestjs/common';
import { TaskRelationsService } from './task-relations.service';
import { TaskRelationsController } from './task-relations.controller';
import { AuthModule } from 'auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from '@backend/roles/roles.model';
import { User } from '@backend/users/users.model';
import { UserRole } from '@backend/roles/user-roles.model';
import { TaskRelation } from './task-relations.model';
import { Task } from '@backend/tasks/tasks.model';

@Module({
  providers: [TaskRelationsService],
  controllers: [TaskRelationsController],
  imports: [
    SequelizeModule.forFeature([Role, User, UserRole, Task, TaskRelation]),
    AuthModule,
  ],
  exports: [TaskRelationsService],
})
export class TaskRelationsModule {}
