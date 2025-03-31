import { ApiProperty } from '@nestjs/swagger';
import { User } from '@backend/users/users.model';

export class AuthResponseDto {
    @ApiProperty({ type: User })
    public user: User;

    @ApiProperty({ description: 'Session ID for authentication' })
    public sessionId: string;
}
