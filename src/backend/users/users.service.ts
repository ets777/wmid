import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IUser } from './users.interface';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AddRoleDto } from './dto/add-role.dto';
import { DB_CONNECTION } from '@backend/database/database.module';
import { ResultSetHeader } from 'mysql2/promise';
import { DatabaseHelper } from '@backend/database/database.helper';
import { DatabaseTable } from '@backend/database/database.enum';
import { CommonHelper } from '@backend/library/common.helper';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DB_CONNECTION) private mysqlConnection: any,
    private roleService: RolesService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<IUser> {
    const [result]: [ResultSetHeader] = await this.mysqlConnection.query(`
      insert into usr_users (username, email, password)
      values ('${createUserDto.username}', '${createUserDto.email}', '${createUserDto.password}')
    `);

    const role = await this.roleService.getRoleByCode('USER');

    return {
      ...createUserDto,
      id: result.insertId,
      roles: [role],
    };
  }

  async getAllUsers(): Promise<IUser[]> {
    const [users]: [IUser[]] = await this.mysqlConnection.query(`
      select id, username, email 
      from usr_users
    `);

    return users;
  }

  // async getUserByEmail(email: string): Promise<IUser> {
  //   const user = await this.userRepository.findOne({
  //     where: { email },
  //     include: { all: true },
  //   });

  //   return user;
  // }

  async getUserByName(username: string): Promise<IUser> {
    const [[user]]: [[IUser]] = await this.mysqlConnection.query(`
      select id, username, password, email, refreshToken
      from usr_users 
      where username = '${username}'
    `);

    const roles = await this.roleService.getUserRoles(username);

    return {
      ...user,
      roles,
    };
  }

  async getUserByNameOrEmail(username: string, email: string): Promise<IUser> {
    const [[user]]: [[IUser]] = await this.mysqlConnection.query(`
      select id, username, password, email 
      from usr_users 
      where username = '${username}'
        or email = '${email}'
    `);

    return user;
  }

  async addRole(dto: AddRoleDto): Promise<number> {
    const user = await this.getUserByName(dto.username);
    const role = await this.roleService.getRoleByCode(dto.code);

    if (role && user) {
      const [res]: [ResultSetHeader] = await this.mysqlConnection.query(`
        insert into usr_userRoles (userId, roleId)
        values (${user.id}, ${role.id})
      `);

      return res.affectedRows;
    }

    throw new HttpException(
      'Пользователь или роль не найдены',
      HttpStatus.NOT_FOUND,
    );
  }

  async deleteUser(username: string): Promise<number> {
    const [result]: [ResultSetHeader] = await this.mysqlConnection.query(`
      delete from ${DatabaseTable.USR_USERS} 
      where username = '${username}'
    `);

    return result.affectedRows;
  }

  async updateRefreshToken(
    username: string,
    refreshToken: string,
  ): Promise<number> {
    const user = this.getUserByName(username);

    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    return this.updateUser(username, { refreshToken });
  }

  async updateUser(username: string, data: IUser): Promise<number> {
    const user = await this.getUserByName(username);

    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    const filteredData = CommonHelper.getFilteredData<IUser>(user, data, [
      'password',
      'email',
      'refreshToken',
    ]);

    const [result]: [ResultSetHeader] = await this.mysqlConnection.query(
      DatabaseHelper.getSqlUpdate(
        DatabaseTable.USR_USERS,
        filteredData,
        { username },
        true,
      ),
    );

    return result.affectedRows;
  }
}
