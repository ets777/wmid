import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '@backend/database/database.module';

@Module({
  providers: [RolesService],
  controllers: [RolesController],
  imports: [AuthModule, DatabaseModule],
  exports: [RolesService],
})
export class RolesModule {}
