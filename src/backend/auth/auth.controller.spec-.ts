import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { UsersService } from '@backend/users/users.service';
import { RolesService } from '@backend/roles/roles.service';
import { UsersController } from '@backend/users/users.controller';
import { SessionService } from '@backend/session/session.service';
import { Response, Request } from 'express';

describe('AuthController', () => {
    let authController: AuthController;
    let usersController: UsersController;
    let module: TestingModule;
    const testUsername = 'authTest';
    const testSessionId = 'test-session-id';

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
                SessionService,
            ],
            controllers: [AuthController, UsersController],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        usersController = module.get<UsersController>(UsersController);
    });

    afterAll(async () => {
        await usersController.delete(testUsername);
        await module.close();
    });

    describe('signUp', () => {
        it(`should sign up user ${testUsername}`, async () => {
            const dto = {
                username: testUsername,
                email: `${testUsername}@example.com`,
                password: 'Password999!',
                timezone: '+00:00',
            };

            const result = await authController.signUp(dto);

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('sessionId');
        });
    });

    describe('signIn', () => {
        it(`should sign in user ${testUsername}`, async () => {
            const dto = {
                username: testUsername,
                password: 'Password999!',
            };

            const result = await authController.signIn(dto);

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('sessionId');
        });
    });

    describe('signOut', () => {
        it(`should sign out user ${testUsername}`, async () => {
            const mockRequest = {
                cookies: {
                    sessionId: testSessionId,
                },
            } as unknown as Request;

            const result = await authController.signOut(mockRequest);

            expect(result).toBe(true);
        });
    });
});
