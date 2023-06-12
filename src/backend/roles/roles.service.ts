import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from './roles.model';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role) private roleRepository: typeof Role) {}

  async createRole(dto: CreateRoleDto): Promise<Role> {
    const role = await this.roleRepository.create(dto);
    return role;
  }

  async deleteRole(code: string): Promise<number> {
    const affectedRows = await this.roleRepository.destroy({ where: { code } });
    return affectedRows;
  }

  async getRoleByCode(code: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { code } });
    return role;
  }
}
