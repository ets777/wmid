import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { TaskCategoriesModule } from './task-categories/task-categories.module';
import { TaskPeriodsModule } from 'task-periods/task-periods.module';
import { DatabaseModule } from './database/database.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    UsersModule,
    RolesModule,
    AuthModule,
    TasksModule,
    TaskCategoriesModule,
    TaskPeriodsModule,
    DatabaseModule,
  ],
})
export class AppModule {}
