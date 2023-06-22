import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const rolesKey = 'roles';

export const Roles = (...roles: string[]): CustomDecorator<string> => {
  return SetMetadata(rolesKey, roles);
};
