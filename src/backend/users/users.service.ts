import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './users.model';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AddRoleDto } from './dto/add-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    private roleService: RolesService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const userDb = await this.userRepository.create(dto);
    const user = userDb?.dataValues;
    const roleDb = await this.roleService.getRoleByCode('USER');
    const role = roleDb?.dataValues;

    await userDb.$set('roles', [role.id]);
    user.roles = [role];

    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.userRepository.findAll({ include: { all: true } });
    return users;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      include: { all: true },
    });

    return user;
  }

  async getUserByName(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
      include: { all: true },
    });

    return user;
  }

  async getUserByNameOrEmail(username: string, email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: [{ username }, { email }],
      include: { all: true },
    });

    return user;
  }

  async addRole(dto: AddRoleDto): Promise<AddRoleDto> {
    const user = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    const role = await this.roleService.getRoleByCode(dto.code);

    if (role && user) {
      await user.$add('role', role.id);
      return dto;
    }

    throw new HttpException(
      'Пользователь или роль не найдены',
      HttpStatus.NOT_FOUND,
    );
  }

  async deleteUser(username: string): Promise<number> {
    const affectedRows = await this.userRepository.destroy({
      where: { username },
    });

    return affectedRows;
  }

  async updateRefreshToken(
    username: string,
    refreshToken: string,
  ): Promise<number> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    const updatedData = {
      ...user,
      refreshToken,
    };

    const updatedUser = await this.userRepository.update(updatedData, {
      where: { username },
    });

    const [affectedRows] = updatedUser;

    return affectedRows;
  }

  async updateUser(username: string, data: CreateUserDto): Promise<number> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    const filteredData = {
      password: data.password,
      email: data.email,
    };

    const updatedData = {
      ...user,
      ...filteredData,
    };

    const updatedUser = await this.userRepository.update(updatedData, {
      where: { username },
    });

    const [affectedRows] = updatedUser;

    return affectedRows;
  }
}
