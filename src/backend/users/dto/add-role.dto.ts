import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddRoleDto {
  @ApiProperty({
    example: 'admin',
    description: 'Код роли',
  })
  @IsString({ message: 'Должно быть строкой' })
  readonly code: string;

  @ApiProperty({
    example: 'user',
    description: 'Имя пользователя',
  })
  @IsString({ message: 'Должно быть строкой' })
  readonly username: string;
}
