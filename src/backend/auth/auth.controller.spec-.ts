import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@backend/users/users.service';
import { RolesService } from '@backend/roles/roles.service';
import { UsersController } from '@backend/users/users.controller';
import { createPool } from 'mysql2/promise';
import { DB_CONNECTION } from '@backend/database/database.module';

const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_TEST,
  timezone: process.env.DB_TIMEZONE,
});

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
        {
          provide: DB_CONNECTION,
          useValue: pool,
        },
      ],
      controllers: [AuthController, UsersController],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    usersController = module.get<UsersController>(UsersController);
  });

  afterAll(async () => {
    await usersController.delete(testUsername);
    await pool.end();
    await module.close();
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
