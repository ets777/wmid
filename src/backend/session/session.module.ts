import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Session } from './session.model';

@Module({
    imports: [
        SequelizeModule.forFeature([Session]),
    ],
    providers: [SessionService],
    exports: [SessionService],
})
export class SessionModule {} 