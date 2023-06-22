import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/users.model';
import { ConfigService } from '@nestjs/config';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserCredentialsDto } from '../users/dto/user-credentials.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signIn(userDto: UserCredentialsDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(userDto);
    const tokens = await this.getTokens(user);
    await this.updateRefreshToken(user.username, tokens.refreshToken);

    return tokens;
  }

  async signOut(username: string): Promise<boolean> {
    const user = await this.usersService.getUserByName(username);

    if (!user) {
      throw new HttpException(
        'Пользователя с таким именем не существует',
        HttpStatus.NOT_FOUND,
      );
    }

    const updateSucceed = await this.updateRefreshToken(user.username, null);

    if (!updateSucceed) {
      throw new HttpException(
        'Не удалось удалить токен. Выход не выполнен.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return updateSucceed;
  }

  async signUp(userDto: CreateUserDto): Promise<AuthResponseDto> {
    const existingUser = await this.usersService.getUserByNameOrEmail(
      userDto.username,
      userDto.email,
    );

    if (existingUser) {
      throw new HttpException(
        'Пользователь с таким именем или email уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashPassword = await this.hashData(userDto.password);
    const userDb = await this.usersService.createUser({
      ...userDto,
      password: hashPassword,
    });
    const user = userDb?.dataValues;

    const tokens = await this.getTokens(user);

    const updateSucceed = await this.updateRefreshToken(
      user.username,
      tokens.refreshToken,
    );

    if (!updateSucceed) {
      throw new HttpException(
        'Не удалось сохранить токен. Вход не выполнен.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return tokens;
  }

  private async getTokens(user: User): Promise<AuthResponseDto> {
    const payload = {
      username: user.username,
      id: user.id,
      roles: user.roles,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '30m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '30d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(
    username: string,
    refreshToken: string,
  ): Promise<boolean> {
    const hashedRefreshToken = await this.hashData(refreshToken);
    const affectedRows = await this.usersService.updateUser(username, {
      refreshToken: hashedRefreshToken,
    });

    return affectedRows === 1;
  }

  private async hashData(password: string): Promise<string> {
    return password ? await bcrypt.hash(password, 5) : null;
  }

  private async validateUser(userDto: UserCredentialsDto): Promise<User> {
    const userDb = await this.usersService.getUserByName(userDto.username);
    const user = userDb?.dataValues;
    const passwordsEqual = await bcrypt.compare(
      userDto.password,
      user?.password || '',
    );

    if (!user || !passwordsEqual) {
      throw new UnauthorizedException({
        message: 'Некорректное имя пользователя или пароль',
      });
    }

    return user;
  }

  async refreshTokens(
    username: string,
    refreshToken: string,
  ): Promise<AuthResponseDto> {
    const existingUserDb = await this.usersService.getUserByName(username);
    const existingUser = existingUserDb?.dataValues;

    if (!existingUser?.refreshToken) {
      throw new UnauthorizedException({
        message: 'Пользователь не авторизован',
      });
    }
    const refreshTokensEqual = await bcrypt.compare(
      refreshToken,
      existingUser.refreshToken,
    );

    if (!refreshTokensEqual) {
      throw new UnauthorizedException({
        message: 'Пользователь не авторизован',
      });
    }

    const tokens = await this.getTokens(existingUser);
    const updateSucceed = await this.updateRefreshToken(
      existingUser.username,
      tokens.refreshToken,
    );

    if (!updateSucceed) {
      throw new HttpException(
        'Не удалось сохранить токен. Вход не выполнен.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return tokens;
  }
}
