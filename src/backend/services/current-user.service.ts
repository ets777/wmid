import { Injectable } from '@nestjs/common';
import { User } from '@backend/users/users.model';

@Injectable()
export class CurrentUserService {
    private currentUser: User | null = null;

    setCurrentUser(user: User | null): void {
        this.currentUser = user;
    }

    getCurrentUser(): User | null {
        return this.currentUser;
    }

    clearCurrentUser(): void {
        this.currentUser = null;
    }
} 