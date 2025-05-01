import { IRole } from '@backend/roles/roles.interface';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Length } from 'class-validator';

export class UserFromTokenDto {
    @ApiProperty({
        example: 'user',
        description: 'Имя пользователя',
    })
    @IsString({ message: 'Must be a string' })
    @Length(4, 16, { message: 'Значение должно быть длиной от 4 до 16 символов' })
    readonly username: string;

    @ApiProperty({
        example: 1,
        description: 'ID пользователя',
    })
    @IsNumber(null, { message: 'Must be a number' })
    id: number;

    @ApiProperty({
        example: [{ id: 1, code: 'admin', name: 'Админ' }],
        description: 'Роли пользователя',
    })
    roles: IRole[];
}
