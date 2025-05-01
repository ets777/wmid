import { IsEmail, IsString } from 'class-validator';
import { UserCredentialsDto } from './user-credentials.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto extends UserCredentialsDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User\'s email',
    })
    @IsString({ message: 'Must be a string' })
    @IsEmail({}, { message: 'Incorrect email' })
    public readonly email: string;

    @ApiProperty({
        example: '+07:00',
        description: 'User\'s timezone',
    })
    @IsString({ message: 'Must be a string' })
    public readonly timezone: string;
}
