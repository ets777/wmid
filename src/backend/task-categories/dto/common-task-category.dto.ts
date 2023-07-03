import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CommonTaskCategoryDto {
  @ApiProperty({
    example: 'Хобби',
    description: 'Название категории',
  })
  @IsString({ message: 'Должно быть строкой' })
  name: string;
}
