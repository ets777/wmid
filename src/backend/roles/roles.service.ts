import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from './roles.model';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role) private roleRepository: typeof Role,
  ) { }

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
    const role = this.getRoleByCode(code);

    if (!role) {
      throw new HttpException('Роль не найдена', HttpStatus.NOT_FOUND);
    }

    const [affectedRows] = await this.roleRepository.update(data, { where: { code } });

    return affectedRows;
  }

  // TODO: move it to user controller
  // async getUserRoles(username: string): Promise<Role[]> {
  //   const roles = await this.roleRepository.findAll({ where: { username } });
  //   return roles;
  // }
}
