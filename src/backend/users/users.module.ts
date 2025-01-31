import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RolesModule } from '../roles/roles.module';
import { AuthModule } from '../auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users.model';
import { Role } from '@backend/roles/roles.model';
import { UserRole } from '@backend/roles/user-roles.model';

@Module({
    providers: [UsersService],
    controllers: [UsersController],
    imports: [
        SequelizeModule.forFeature([User, Role, UserRole]),
        RolesModule,
        forwardRef(() => AuthModule),
    ],
    exports: [UsersService],
})
export class UsersModule { }
