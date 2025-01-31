import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from './roles.model';
import { ConfigModule } from '@nestjs/config';
import { RolesController } from './roles.controller';
import { User } from '../users/users.model';
import { UserRole } from './user-roles.model';
import { JwtService } from '@nestjs/jwt';

describe('RoleController', () => {
  let controller: RolesController;
  let module: TestingModule;
  const testRoleCode = 'test';

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
          models: [Role, User, UserRole],
          autoLoadModels: true,
          logging: false,
        }),
        SequelizeModule.forFeature([Role, User, UserRole]),
      ],
      providers: [RolesService, JwtService],
      controllers: [RolesController],
    }).compile();
    controller = module.get<RolesController>(RolesController);
  });

  afterAll(async () => {
    module.close();
  });

  describe('getByCode', () => {
    it('should be an admin role', async () => {
      const result = await controller.getByCode('admin');
      expect(result).toBeTruthy();
    });
    it('should be an user role', async () => {
      const result = await controller.getByCode('user');
      expect(result).toBeTruthy();
    });
  });

  describe('create', () => {
    it(`should create ${testRoleCode} role`, async () => {
      const dto = {
        code: testRoleCode,
        name: 'Тестовая роль',
      };
      const result = await controller.create(dto);
      expect(result).toBeTruthy();
    });
  });
  
  describe('delete', () => {
    it(`should delete ${testRoleCode} role`, async () => {
      const result = await controller.delete(testRoleCode);
      expect(result).toBe(1);
    });
  });
});