import { ApiProperty } from '@nestjs/swagger';
import { CommonTaskDto } from './common-task.dto';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class UpdateTaskDto extends CommonTaskDto {
    @ApiProperty({
        example: 'Заправить кровать',
        description: 'Текст задания',
    })
    @IsString({ message: 'Должно быть строкой' })
    text?: string;

    @ApiProperty({
        example: 20,
        description: 'Продолжительность задания в минутах',
    })
    @IsNumber(null, { message: 'Must be a number' })
    duration?: number;

    @ApiProperty({
        example: 1,
        description: 'ID категории',
    })
    @IsNumber(null, { message: 'Must be a number' })
    categoryId?: number;

    @ApiProperty({
        example: false,
        description: 'Флаг удалённого задания',
    })
    @IsBoolean({ message: 'Должно быть булевым значением' })
    isDeleted?: boolean;
}
