import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '@backend/users/users.module';
import { SessionModule } from '@backend/session/session.module';

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [UsersModule, SessionModule],
    exports: [AuthService],
})
export class AuthModule { }
