import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RolesModule } from '@backend/roles/roles.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users.model';
import { Role } from '@backend/roles/roles.model';
import { UserRole } from '@backend/roles/user-roles.model';
import { SessionModule } from '@backend/session/session.module';

@Module({
    providers: [UsersService],
    controllers: [UsersController],
    imports: [
        SequelizeModule.forFeature([User, Role, UserRole]),
        RolesModule,
        SessionModule,
    ],
    exports: [UsersService],
})
export class UsersModule { }
