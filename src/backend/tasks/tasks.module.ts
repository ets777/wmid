import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AuthModule } from 'auth/auth.module';
import { TaskPeriodsModule } from '@backend/task-periods/task-periods.module';
import { DatabaseModule } from '@backend/database/database.module';

@Module({
  providers: [TasksService],
  controllers: [TasksController],
  imports: [AuthModule, TaskPeriodsModule, DatabaseModule],
  exports: [],
})
export class TasksModule {}
