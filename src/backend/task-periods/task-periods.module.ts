import { Module } from '@nestjs/common';
import { TaskPeriodsService } from './task-periods.service';
import { AuthModule } from '@backend/auth/auth.module';
import { DatabaseModule } from '@backend/database/database.module';

@Module({
  providers: [TaskPeriodsService],
  controllers: [],
  imports: [AuthModule, DatabaseModule],
  exports: [TaskPeriodsService],
})
export class TaskPeriodsModule {}
