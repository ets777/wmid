import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { UserBasicAttrDto } from './user-basic-attr.dto';

export class CreateUserDto extends UserBasicAttrDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Электронная почта',
  })
  @IsString({ message: 'Должно быть строкой' })
  @IsEmail({}, { message: 'Некорректный email' })
  readonly email: string;
}
