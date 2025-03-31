import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { TaskCategoriesModule } from './task-categories/task-categories.module';
import { TaskPeriodsModule } from 'task-periods/task-periods.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users/users.model';
import { Role } from './roles/roles.model';
import { UserRole } from './roles/user-roles.model';
import { Task } from '@backend/tasks/tasks.model';
import { TaskCategory } from 'task-categories/task-categories.model';
import { TaskPeriod } from 'task-periods/task-periods.model';
import { TaskAppointment } from './task-appointments/task-appointments.model';
import { TaskRelation } from './task-relations/task-relations.model';
import { SessionModule } from './session/session.module';
import { Session } from './session/session.model';
import { ServicesModule } from './services/services.module';
import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';

@Module({
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: CurrentUserInterceptor,
        },
    ],
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
            models: [
                Role,
                Session,
                Task,
                TaskAppointment,
                TaskCategory,
                TaskPeriod,
                TaskRelation,
                User,
                UserRole,
            ],
            autoLoadModels: true,
        }),
        UsersModule,
        RolesModule,
        SessionModule,
        AuthModule,
        TasksModule,
        TaskCategoriesModule,
        TaskPeriodsModule,
        ServicesModule,
    ],
})
export class AppModule { }
