import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsArray } from 'class-validator';
import { Role } from '@backend/roles/roles.model';

export class UserBasicAttrDto {
    @ApiProperty({
        example: 'user',
        description: 'User name',
    })
    @IsString({ message: 'Must be a string' })
    @Length(4, 16, { message: 'Значение должно быть длиной от 4 до 16 символов' })
    public readonly username: string;
    
    @ApiProperty({ example: 'Password999!', description: 'Пароль' })
    @IsString({ message: 'Must be a string' })
    @Length(4, 16, { message: 'Значение должно быть длиной от 4 до 16 символов' })
    public readonly password: string;

    @ApiProperty({ type: [Role], description: 'User roles' })
    @IsArray()
    public readonly roles?: Role[];
}