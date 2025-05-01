import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddRoleDto {
    @ApiProperty({
        example: 'admin',
        description: 'Role\'s code',
    })
    @IsString({ message: 'Should be string' })
    readonly code: string;

    @ApiProperty({
        example: 1,
        description: 'User\'s ID',
    })
    @IsNumber({}, { message: 'Must be a number' })
    readonly userId: number;
}