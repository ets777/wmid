import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { rolesKey } from '../roles-auth.decorator';
import { Role } from '../../roles/roles.model';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        rolesKey,
        [context.getHandler(), context.getClass()],
      );

      if (!requiredRoles) {
        return true;
      }

      const req = context.switchToHttp().getRequest();

      return req.user.roles.some((role: Role) =>
        requiredRoles.includes(role.code),
      );
    } catch (e) {
      throw new HttpException('Нет доступа', HttpStatus.FORBIDDEN);
    }
  }
}
