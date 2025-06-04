import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '@backend/users/dto/create-user.dto';
import { UsersService } from '@backend/users/users.service';
import * as bcrypt from 'bcryptjs';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserCredentialsDto } from '@backend/users/dto/user-credentials.dto';
import { User } from '@backend/users/users.model';
import { SessionService } from '@backend/session/session.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private sessionService: SessionService,
    ) { }

    async signIn(userDto: UserCredentialsDto): Promise<AuthResponseDto> {
        const user = await this.validateUser(userDto);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const session = await this.sessionService.createSession(user);
        return { user, sessionId: session.sessionId };
    }

    async signOut(sessionId: string): Promise<boolean> {
        await this.sessionService.invalidateSession(sessionId);
        return true;
    }

    public async signUp(userDto: CreateUserDto): Promise<AuthResponseDto> {
        const user = await this.usersService.createUser(userDto);
        const session = await this.sessionService.createSession(user);
        return { user, sessionId: session.sessionId };
    }

    public async checkAuth(sessionId: string): Promise<AuthResponseDto | null> {
        if (!sessionId) {
            return null;
        }

        const session = await this.sessionService.getSession(sessionId);
        if (!session || !session.isValid) {
            return null;
        }

        const user = await this.usersService.getUserById(session.userId);
        if (!user) {
            return null;
        }

        return { user, sessionId: session.sessionId };
    }

    private async validateUser(userDto: UserCredentialsDto): Promise<User> {
        const user = await this.usersService.getUserByName(userDto.username);
        const passwordsEqual = await bcrypt.compare(
            userDto.password,
            user?.password || '',
        );

        if (!user || !passwordsEqual) {
            throw new UnauthorizedException({
                message: 'Invalid username or password',
            });
        }

        return user;
    }
}
