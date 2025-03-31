import { Module, Global } from '@nestjs/common';
import { CurrentUserService } from './current-user.service';
import { CurrentUserInterceptor } from '@backend/interceptors/current-user.interceptor';
import { AuthModule } from '@backend/auth/auth.module';

@Global()
@Module({
    imports: [AuthModule],
    providers: [CurrentUserService, CurrentUserInterceptor],
    exports: [CurrentUserService, CurrentUserInterceptor],
})
export class ServicesModule {} 