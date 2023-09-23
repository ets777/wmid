import { IRole } from '@backend/roles/roles.interface';
import { IsNumber, IsString, Length } from 'class-validator';

export class UserFromTokenDto {
  @IsString({ message: 'Значение должно быть строкой' })
  @Length(4, 16, { message: 'Значение должно быть длиной от 4 до 16 символов' })
  readonly username: string;

  @IsNumber(null, { message: 'Должно быть числом' })
  id: number;

  roles: IRole[];
}
