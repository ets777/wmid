import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { rolesKey } from '@backend/auth/roles-auth.decorator';
import { Role } from '@backend/roles/roles.model';
import { SessionService } from '@backend/session/session.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private sessionService: SessionService,
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        try {
            const requiredRoles = this.reflector.getAllAndOverride<string[]>(
                rolesKey,
                [context.getHandler(), context.getClass()],
            );

            if (!requiredRoles) {
                return true;
            }

            const request = context.switchToHttp().getRequest();
            const sessionId = request.headers['x-session-id'];

            if (!sessionId) {
                return false;
            }

            const session = await this.sessionService.getSession(sessionId);

            console.log(session);

            return session.user.roles.some((role: Role) =>
                requiredRoles
                    .map((role) => role.toUpperCase())
                    .includes(role.code.toUpperCase()),
            );
        } catch {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }
    }
}
