import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Length } from 'class-validator';
import { Role } from 'roles/roles.model';

export class UserFromTokenDto {
  @ApiProperty({
    example: 'user',
    description: 'Имя пользователя',
  })
  @IsString({ message: 'Значение должно быть строкой' })
  @Length(4, 16, { message: 'Значение должно быть длиной от 4 до 16 символов' })
  readonly username: string;

  @ApiProperty({
    example: 1,
    description: 'ID пользователя',
  })
  @IsNumber(null, { message: 'Должно быть числом' })
  id: number;

  @ApiProperty({
    example: [{ id: 1, code: 'admin', name: 'Админ' }],
    description: 'Роли пользователя',
  })
  roles: Role[];
}
