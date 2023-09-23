import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users.controller';
import { RolesService } from '../roles/roles.service';
import { JwtService } from '@nestjs/jwt';
import { createPool } from 'mysql2/promise';
import { DB_CONNECTION } from '@backend/database/database.module';

const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_TEST,
  timezone: process.env.DB_TIMEZONE,
});

describe('UsersController', () => {
  let controller: UsersController;
  let module: TestingModule;
  const testUsername = 'userTest';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: `.${process.env.NODE_ENV}.env`,
        }),
      ],
      providers: [
        UsersService,
        RolesService,
        JwtService,
        {
          provide: DB_CONNECTION,
          useValue: pool,
        },
      ],
      controllers: [UsersController],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterAll(async () => {
    await pool.end();
    await module.close();
  });

  describe('create', () => {
    it(`should create an user ${testUsername}`, async () => {
      const dto = {
        username: testUsername,
        email: `${testUsername}@example.com`,
        password: 'Password999!',
      };

      const result = await controller.create(dto);
      expect(result.id).toBeGreaterThan(0);
    });
  });

  describe('getAll', () => {
    it('should get all users', async () => {
      const result = await controller.getAll();

      expect(result).toBeTruthy();
    });
  });

  describe('addRole', () => {
    it(`should add role to user ${testUsername}`, async () => {
      const dto = {
        username: testUsername,
        code: 'admin',
      };

      const result = await controller.addRole(dto);

      expect(result).toBe(1);
    });
  });

  describe('delete', () => {
    it(`should delete user ${testUsername}`, async () => {
      const result = await controller.delete(testUsername);

      expect(result).toBe(1);
    });
  });
});
