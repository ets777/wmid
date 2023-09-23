import { IsString, Length } from 'class-validator';

export class UserCredentialsDto {
  @IsString({ message: 'Значение должно быть строкой' })
  @Length(4, 16, { message: 'Значение должно быть длиной от 4 до 16 символов' })
  readonly username: string;

  @IsString({ message: 'Значение должно быть строкой' })
  @Length(4, 16, { message: 'Значение должно быть длиной от 4 до 16 символов' })
  readonly password: string;
}
