import { Module } from '@nestjs/common';
import { TaskAppointmentService } from './task-appointments.service';
import { AuthModule } from 'auth/auth.module';

@Module({
  providers: [TaskAppointmentService],
  controllers: [],
  imports: [AuthModule],
  exports: [TaskAppointmentService],
})
export class TaskAppointmentModule {}
