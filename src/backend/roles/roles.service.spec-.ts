import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from './roles.model';
import { ConfigModule } from '@nestjs/config';
import { User } from '../users/users.model';
import { UserRole } from './user-roles.model';

describe('RolesService', () => {
  let service: RolesService;
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
      providers: [RolesService],
    }).compile();
    service = module.get<RolesService>(RolesService);
  });

  afterAll(async () => {
    module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRole', () => {
    it(`should create ${testRoleCode} role`, async () => {
      const dto = {
        code: testRoleCode,
        name: 'Тестовая роль',
      };
      const result = await service.createRole(dto);
      expect(result.code).toBe(testRoleCode);
    });
  });

  describe('getRoleByCode', () => {
    it('should be an admin role', async () => {
      const result = await service.getRoleByCode('admin');
      expect(result).toBeTruthy();
    });
    it('should be an user role', async () => {
      const result = await service.getRoleByCode('user');
      expect(result).toBeTruthy();
    });
    it(`should be ${testRoleCode} role`, async () => {
      const result = await service.getRoleByCode(testRoleCode);
      expect(result).toBeTruthy();
    });
  });

  describe('getAllRoles', () => {
    it('should return an array of roles', async () => {
      const result = await service.getAllRoles();
      expect(Array.isArray(result)).toBeTruthy();
    });
  });

  describe('updateRole', () => {
    it(`should update ${testRoleCode} role`, async () => {
      const updatedRoleName = 'Обновленная тестовая роль';
      const affectedRows = await service.updateRole(testRoleCode, {
        code: testRoleCode,
        name: updatedRoleName,
      });
      expect(affectedRows).toBe(1);
      const updatedRole = await service.getRoleByCode(testRoleCode);
      expect(updatedRole.name).toBe(updatedRoleName);
    });
  });

  describe('deleteRole', () => {
    it(`should delete ${testRoleCode} role`, async () => {
      const result = await service.deleteRole(testRoleCode);
      expect(result).toBe(1);
    });
  });
});

