import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RolesService } from '@backend/roles/roles.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AddRoleDto } from './dto/add-role.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './users.model';
import { Role } from '@backend/roles/roles.model';
import { Op } from 'sequelize';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User) private userRepository: typeof User,
        private roleService: RolesService,
    ) { }

    public async createUser(createUserDto: CreateUserDto): Promise<User> {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = await this.userRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });
        const role = await this.roleService.getRoleByCode('USER');
        await user.$set('roles', [role.id]);
        user.roles = [role];

        return user;
    }

    public async getAllUsers(): Promise<User[]> {
        const users = await this.userRepository.findAll({ include: { all: true } });

        return users;
    }

    public async getUserById(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            include: [{ model: Role }],
        });

        return user;
    }

    // async getUserByEmail(email: string): Promise<IUser> {
    //   const user = await this.userRepository.findOne({
    //     where: { email },
    //     include: { all: true },
    //   });

    //   return user;
    // }

    public async getUserByName(username: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { username },
            include: [{ model: Role }],
        });

        return user;
    }

    public async getUserByNameOrEmail(username: string, email: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: [{ [Op.or]: [{ username }, { email }]}],
            include: { all: true },
        });

        return user;
    }

    public async addRole(dto: AddRoleDto): Promise<AddRoleDto> {
        const user = await this.getUserByName(dto.username);
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

    public async deleteUser(username: string): Promise<number> {
        const affectedRows = await this.userRepository.destroy({
            where: { username },
        });

        return affectedRows;
    }

    public async updateRefreshToken(
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

    public async updateUser(username: string, data: CreateUserDto): Promise<number> {
        const user = await this.userRepository.findOne({
            where: { username },
        });

        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }

        const updatedData = {
            ...user,
            ...data,
        };

        const updatedUser = await this.userRepository.update(updatedData, {
            where: { username },
        });

        const [affectedRows] = updatedUser;

        return affectedRows;
    }

    public async isUsernameAvailable(username: string): Promise<boolean> {
        const user = await this.getUserByNameOrEmail(username, '');
        return !user;
    }

    public async isEmailAvailable(email: string): Promise<boolean> {
        const user = await this.getUserByNameOrEmail('', email);
        return !user;
    }
}
