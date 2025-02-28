import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CommonTaskCategoryDto {
    @ApiProperty({
        example: 'Хобби',
        description: 'Название категории',
    })
    @IsString({ message: 'Must be a string' })
    public name: string;
}
