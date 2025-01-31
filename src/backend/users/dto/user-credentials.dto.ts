import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UserCredentialsDto {
  @ApiProperty({
    example: 'user',
    description: 'Имя пользователя',
  })
  @IsString({ message: 'Значение должно быть строкой' })
  @Length(4, 16, { message: 'Значение должно быть длиной от 4 до 16 символов' })
  readonly username: string;

  @ApiProperty({ example: 'Password999!', description: 'Пароль' })
  @IsString({ message: 'Значение должно быть строкой' })
  @Length(4, 16, { message: 'Значение должно быть длиной от 4 до 16 символов' })
  readonly password: string;
}
