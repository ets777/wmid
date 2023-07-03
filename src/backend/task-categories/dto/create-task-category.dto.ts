import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CommonTaskCategoryDto } from './common-task-category.dto';

export class CreateTaskCategoryDto extends CommonTaskCategoryDto {
  @ApiProperty({
    example: 'HOBBY',
    description: 'Код категории',
  })
  @IsString({ message: 'Должно быть строкой' })
  code: string;
}
