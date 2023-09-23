import { Module } from '@nestjs/common';
import { TaskCategoriesService } from './task-categories.service';
import { TaskCategoriesController } from './task-categories.controller';
import { AuthModule } from 'auth/auth.module';
import { DatabaseModule } from '@backend/database/database.module';

@Module({
  providers: [TaskCategoriesService],
  controllers: [TaskCategoriesController],
  imports: [DatabaseModule, AuthModule],
  exports: [],
})
export class TaskCategoriesModule {}
