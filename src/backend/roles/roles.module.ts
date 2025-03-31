import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from './roles.model';
import { User } from '@backend/users/users.model';
import { UserRole } from './user-roles.model';
import { SessionModule } from '@backend/session/session.module';

@Module({
    providers: [RolesService],
    controllers: [RolesController],
    imports: [
        SequelizeModule.forFeature([Role, User, UserRole]),
        SessionModule,
    ],
    exports: [RolesService],
})
export class RolesModule { }
