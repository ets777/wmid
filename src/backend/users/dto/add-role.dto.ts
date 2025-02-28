import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddRoleDto {
    @ApiProperty({
        example: 'admin',
        description: 'Код роли',
    })
    @IsString({ message: 'Must be a string' })
    public readonly code: string;

    @ApiProperty({
        example: 'user',
        description: 'Имя пользователя',
    })
    @IsString({ message: 'Must be a string' })
    public readonly username: string;
}
