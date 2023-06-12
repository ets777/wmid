import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'admin',
    description: 'Код роли',
  })
  @IsString({ message: 'Должно быть строкой' })
  readonly code: string;

  @ApiProperty({
    example: 'Админ',
    description: 'Название роли',
  })
  @IsString({ message: 'Должно быть строкой' })
  readonly name: string;
}
