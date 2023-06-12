import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.model';
import { RolesService } from '../roles/roles.service';
import { Role } from '../roles/roles.model';
import { UserRole } from '../roles/user-roles.model';
import { UsersController } from '../users/users.controller';

describe('AuthController', () => {
  let authController: AuthController;
  let usersController: UsersController;
  let module: TestingModule;
  const testUsername = 'authTest';
  const testToken = 'token';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: `.${process.env.NODE_ENV}.env`,
        }),
        SequelizeModule.forRoot({
          dialect: 'mysql',
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT),
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME_TEST,
          models: [User, Role, UserRole],
          autoLoadModels: true,
          logging: false,
        }),
        SequelizeModule.forFeature([User, Role, UserRole]),
      ],
      providers: [
        AuthService,
        UsersService,
        RolesService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockImplementation(() => testToken),
          },
        },
      ],
      controllers: [AuthController, UsersController],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    usersController = module.get<UsersController>(UsersController);
  });

  afterAll(async () => {
    usersController.delete(testUsername);
    module.close();
  });

  describe('signUp', () => {
    it(`should sign up user ${testUsername}`, async () => {
      const dto = {
        username: testUsername,
        email: `${testUsername}@example.com`,
        password: 'Password999!',
      };
      const result = await authController.signUp(dto);

      expect(result).toStrictEqual({
        accessToken: testToken,
        refreshToken: testToken,
      });
    });
  });

  describe('signIn', () => {
    it(`should sign in user ${testUsername}`, async () => {
      const dto = {
        username: testUsername,
        password: 'Password999!',
      };
      const result = await authController.signIn(dto);

      expect(result).toStrictEqual({
        accessToken: testToken,
        refreshToken: testToken,
      });
    });
  });

  describe('refreshTokens', () => {
    it(`should refresh tokens for user ${testUsername}`, async () => {
      const req = {
        user: {
          username: testUsername,
          refreshToken: testToken,
        },
      };
      const result = await authController.refreshTokens(req);

      expect(result).toStrictEqual({
        accessToken: testToken,
        refreshToken: testToken,
      });
    });
  });

  describe('signOut', () => {
    it(`should sign out user ${testUsername}`, async () => {
      const req = {
        user: {
          username: testUsername,
        },
      };
      const result = await authController.signOut(req);

      expect(result).toStrictEqual(true);
    });
  });
});
