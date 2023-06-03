import { SetMetadata } from '@nestjs/common';

export const rolesKey = 'roles';

export const Roles = (...roles: string[]) => SetMetadata(rolesKey, roles);
