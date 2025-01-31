import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users.model';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users.controller';
import { UserRole } from '../roles/user-roles.model';
import { Role } from '../roles/roles.model';
import { RolesService } from '../roles/roles.service';
import { JwtService } from '@nestjs/jwt';

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
            providers: [UsersService, RolesService, JwtService],
            controllers: [UsersController],
        }).compile();

        controller = module.get<UsersController>(UsersController);
    });

    afterAll(async () => {
        module.close();
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
            expect(result).toStrictEqual(dto);
        });
    });

    describe('delete', () => {
        it(`should delete user ${testUsername}`, async () => {
            const result = await controller.delete(testUsername);

            expect(result).toBe(1);
        });
    });
});
