import { IsEmail, IsString } from 'class-validator';
import { UserCredentialsDto } from './user-credentials.dto';

export class CreateUserDto extends UserCredentialsDto {
  @IsString({ message: 'Должно быть строкой' })
  @IsEmail({}, { message: 'Некорректный email' })
  readonly email: string;
}
