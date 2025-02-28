import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateRoleDto {
    @ApiProperty({
        example: 'admin',
        description: 'Код роли',
    })
    @IsString({ message: 'Must be a string' })
    public code: string;

    @ApiProperty({
        example: 'Админ',
        description: 'Название роли',
    })
    @IsString({ message: 'Must be a string' })
    public name: string;
}
