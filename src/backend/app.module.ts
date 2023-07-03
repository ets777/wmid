import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/users.model';
import { RolesModule } from './roles/roles.module';
import { Role } from './roles/roles.model';
import { UserRole } from './roles/user-roles.model';
import { AuthModule } from './auth/auth.module';
import { Task } from 'tasks/tasks.model';
import { TaskCategory } from 'task-categories/task-categories.model';
import { TasksModule } from './tasks/tasks.module';
import { TaskCategoriesModule } from './task-categories/task-categories.module';
import { TaskPeriod } from 'task-periods/task-periods.model';
import { TaskPeriodsModule } from 'task-periods/task-periods.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      models: [User, Role, UserRole, Task, TaskCategory, TaskPeriod],
      autoLoadModels: true,
    }),
    UsersModule,
    RolesModule,
    AuthModule,
    TasksModule,
    TaskCategoriesModule,
    TaskPeriodsModule,
  ],
})
export class AppModule {}
