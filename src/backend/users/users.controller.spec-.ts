import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RolesService } from '@backend/roles/roles.service';

describe('UsersController', () => {
    let controller: UsersController;
    const testUsername = 'userTest';

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [UsersService, RolesService],
            controllers: [UsersController],
        }).compile();

        controller = module.get<UsersController>(UsersController);
    });

    describe('create', () => {
        it(`should create an user ${testUsername}`, async () => {
            const dto = {
                username: testUsername,
                email: `${testUsername}@example.com`,
                password: 'Password999!',
                timezone: '+00:00',
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
                userId: 1,
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
