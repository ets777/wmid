import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class PostponeTaskDto {
    @ApiProperty({
        example: 10,
        description: 'Postpone time in minutes',
    })
    @IsNumber(null, { message: 'Must be a number' })
    public postponeTimeMinutes: number;
}
