import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RolesModule } from '../roles/roles.module';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '@backend/database/database.module';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  imports: [RolesModule, forwardRef(() => AuthModule), DatabaseModule],
  exports: [UsersService],
})
export class UsersModule {}
