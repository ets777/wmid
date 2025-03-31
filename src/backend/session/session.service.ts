import { Injectable } from '@nestjs/common';
import { Session } from './session.model';
import { User } from '@backend/users/users.model';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '@backend/roles/roles.model';

@Injectable()
export class SessionService {
    public async createSession(user: User, expiresIn: number = 24 * 60 * 60 * 1000): Promise<Session> {
        return Session.create({
            sessionId: uuidv4(),
            userId: user.id,
            expiresAt: new Date(Date.now() + expiresIn),
            isValid: true,
        });
    }

    async getSession(sessionId: string): Promise<Session | null> {
        const session = await Session.findOne({
            where: { sessionId, isValid: true },
            include: [{
                model: User,
                include: [Role],
            }],
        });

        if (!session) {
            return null;
        }

        if (session.expiresAt < new Date()) {
            session.isValid = false;
            await session.save();
            return null;
        }

        return session;
    }

    async invalidateSession(sessionId: string): Promise<void> {
        const session = await Session.findOne({
            where: { sessionId },
        });

        if (session) {
            session.isValid = false;
            await session.save();
        }
    }

    async invalidateUserSessions(userId: number): Promise<void> {
        await Session.update(
            { isValid: false },
            { where: { userId } },
        );
    }
} 