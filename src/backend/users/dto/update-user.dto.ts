import { IsEmail, IsNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiProperty({
        example: 'user',
        description: 'User name',
    })
    @IsString({ message: 'Must be a string' })
    @Length(4, 16, { message: 'Значение должно быть длиной от 4 до 16 символов' })
    readonly username?: string;

    @ApiProperty({ example: 'Password999!', description: 'Пароль' })
    @IsString({ message: 'Must be a string' })
    @Length(4, 16, { message: 'Значение должно быть длиной от 4 до 16 символов' })
    readonly password?: string;

    @ApiProperty({
        example: 'user@example.com',
        description: 'User\'s email',
    })
    @IsString({ message: 'Must be a string' })
    @IsEmail({}, { message: 'Incorrect email' })
    public readonly email?: string;

    @ApiProperty({
        example: '+07:00',
        description: 'User\'s timezone',
    })
    @IsString({ message: 'Must be a string' })
    public readonly timezone?: string;

    @ApiProperty({
        example: 10,
        description: 'User\'s total earned points',
    })
    @IsNumber({}, { message: 'Must be a number' })
    public readonly earnedPoints?: number;
}
