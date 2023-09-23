import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IRole } from './roles.interface';
import { CreateRoleDto } from './dto/create-role.dto';
import { DB_CONNECTION } from '@backend/database/database.module';
import { ResultSetHeader } from 'mysql2/promise';

@Injectable()
export class RolesService {
  constructor(@Inject(DB_CONNECTION) private mysqlConnection: any) {}

  async createRole(dto: CreateRoleDto): Promise<IRole> {
    const [result]: [ResultSetHeader] = await this.mysqlConnection.query(`
      insert into usr_roles (code, name)
      values ('${dto.code}', '${dto.name}')
    `);

    return {
      ...dto,
      id: result.insertId,
    };
  }

  async deleteRole(code: string): Promise<number> {
    const [result]: [ResultSetHeader] = await this.mysqlConnection.query(`
      delete from usr_roles
      where code = '${code.toUpperCase()}'
    `);

    return result.affectedRows;
  }

  async getRoleByCode(code: string): Promise<IRole> {
    const [[role]]: [[IRole]] = await this.mysqlConnection.query(`
      select id, code, name
      from usr_roles
      where code = '${code.toUpperCase()}'
    `);

    return role;
  }

  async getAllRoles(): Promise<IRole[]> {
    const [roles]: [IRole[]] = await this.mysqlConnection.query(`
      select id, code, name
      from usr_roles
    `);

    return roles;
  }

  async updateRole(code: string, data: CreateRoleDto): Promise<number> {
    const role = this.getRoleByCode(code);

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

    const [result]: [ResultSetHeader] = await this.mysqlConnection.query(`
      update usr_users
      set name = '${updatedData.name}'
      where code = '${code.toUpperCase()}'
    `);

    return result.affectedRows;
  }

  async getUserRoles(username: string): Promise<IRole[]> {
    const [roles]: [IRole[]] = await this.mysqlConnection.query(`
      select r.code, r.name
      from usr_roles r
      join usr_userRoles ur on ur.roleId = r.id
      join usr_users u on u.id = ur.userId
      where u.username = '${username}'
    `);

    return roles;
  }
}
