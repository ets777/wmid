import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class DeleteTaskDto {
    @ApiProperty({
        example: false,
        description: 'Флаг удалённого задания',
    })
    @IsBoolean({ message: 'Должно быть булевым значением' })
    deleted: boolean;
}
