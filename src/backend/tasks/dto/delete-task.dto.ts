import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class DeleteTaskDto {
    @ApiProperty({
        example: false,
        description: 'Флаг удалённого задания',
    })
    @IsBoolean({ message: 'Must be boolean' })
    public deleted: boolean;
}
