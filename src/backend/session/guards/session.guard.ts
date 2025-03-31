import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SessionService } from '@backend/session/session.service';

@Injectable()
export class SessionGuard implements CanActivate {
    constructor(private sessionService: SessionService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const sessionId = request.headers['x-session-id'];
        
        if (!sessionId) {
            return false;
        }

        const session = await this.sessionService.getSession(sessionId);

        if (!session) {
            return false;
        }
        
        return true;
    }
} 