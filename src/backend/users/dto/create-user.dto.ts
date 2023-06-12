import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { UserCredentialsDto } from './user-credentials.dto';

export class CreateUserDto extends UserCredentialsDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Электронная почта',
  })
  @IsString({ message: 'Должно быть строкой' })
  @IsEmail({}, { message: 'Некорректный email' })
  readonly email: string;
}
