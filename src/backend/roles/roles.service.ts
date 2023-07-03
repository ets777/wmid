import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from './roles.model';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role) private roleRepository: typeof Role) {}

  async createRole(dto: CreateRoleDto): Promise<Role> {
    dto.code = dto.code.toUpperCase();
    const role = await this.roleRepository.create(dto);
    return role;
  }

  async deleteRole(code: string): Promise<number> {
    const affectedRows = await this.roleRepository.destroy({
      where: { code: code.toUpperCase() },
    });
    return affectedRows;
  }

  async getRoleByCode(code: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { code: code.toUpperCase() },
    });
    return role;
  }

  async getAllRoles(): Promise<Role[]> {
    const roles = await this.roleRepository.findAll({ include: { all: true } });
    return roles;
  }

  async updateRole(code: string, data: CreateRoleDto): Promise<number> {
    const role = await this.roleRepository.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!role) {
      throw new HttpException('Роль не найдена', HttpStatus.NOT_FOUND);
    }

    const filteredData = {
      name: data.name,
    };

    const updatedData = {
      ...role,
      ...filteredData,
    };

    const updatedRole = await this.roleRepository.update(updatedData, {
      where: { code: code.toUpperCase() },
    });

    const [affectedRows] = updatedRole;

    return affectedRows;
  }
}
