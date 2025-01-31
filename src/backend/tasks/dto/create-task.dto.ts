import { IsBoolean, IsNumber, IsString, Min } from 'class-validator';
import { CreateTaskPeriodDto } from '@backend/task-periods/dto/create-task-period.dto';
import { ApiProperty } from '@nestjs/swagger';
import { TaskPeriodType } from '@backend/task-periods/task-periods.enum';

export class CreateTaskDto {
    @ApiProperty({
        example: 'Заправить кровать',
        description: 'Текст задания',
    })
    @IsString({ message: 'Должно быть строкой' })
    text: string;

    @ApiProperty({
        example: 20,
        description: 'Продолжительность задания в минутах',
    })
    @IsNumber(null, { message: 'Must be a number' })
    duration: number;

    @ApiProperty({
        example: 1,
        description: 'ID категории задания',
    })
    @IsNumber(null, { message: 'Must be a number' })
    categoryId: number;

    @ApiProperty({
        example: true,
        description: 'Флаг активности',
    })
    @IsBoolean({ message: 'Должно быть булевым значением' })
    isActive?: boolean;

    @ApiProperty({
        example: '2050-01-01',
        description: 'Дата, до которой задание будет активно',
    })
    @IsString({ message: 'Должно быть строкой' })
    endDate?: string;

    @ApiProperty({
        example: 1,
        description: 'Next task ID',
    })
    @Min(1, { message: 'Must be greater than one' })
    @IsNumber(null, { message: 'Must be a number' })
    nextTaskId?: number;

    @ApiProperty({
        example: 10,
        description: 'Break before next task in minutes',
    })
    @IsNumber(null, { message: 'Must be a number' })
    nextTaskBreak?: number;

    @ApiProperty({
        example: 1,
        description: 'Previous task ID',
    })
    @Min(1, { message: 'Must be greater than one' })
    @IsNumber(null, { message: 'Must be a number' })
    previousTaskId?: number;

    @ApiProperty({
        example: 10,
        description: 'Break after previous task in minutes',
    })
    @IsNumber(null, { message: 'Must be a number' })
    previousTaskBreak?: number;

    @ApiProperty({
        example: 1,
        description: 'ID автора',
    })
    @IsNumber(null, { message: 'Must be a number' })
    userId?: number;

    @ApiProperty({
        example: [
            {
                typeId: TaskPeriodType.DAILY,
                startTime: '07:58:00',
                endTime: '17:58:00',
            },
        ],
        description: 'Task periods',
    })
    periods: CreateTaskPeriodDto[];
}

// {
//     "periodTypeId": 1,
//     "isPartOfChain": true
// }