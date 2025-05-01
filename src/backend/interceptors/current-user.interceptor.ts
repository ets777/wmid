import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CurrentUserService } from '@backend/services/current-user.service';
import { AuthService } from '@backend/auth/auth.service';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
    constructor(
        private readonly currentUserService: CurrentUserService,
        private readonly authService: AuthService,
    ) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
        const request = context.switchToHttp().getRequest();
        const sessionId = request.headers['x-session-id'];

        if (sessionId) {
            const authResponse = await this.authService.checkAuth(sessionId);

            if (authResponse?.user) {
                this.currentUserService.setCurrentUser(authResponse.user);
            } else {
                this.currentUserService.clearCurrentUser();
            }
        } else {
            this.currentUserService.clearCurrentUser();
        }

        return next.handle();
    }
} 