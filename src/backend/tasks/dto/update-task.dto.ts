import { UpdateTaskPeriodDto } from '@backend/task-periods/dto/update-task-period.dto';
import { TaskPeriodType } from '@backend/task-periods/task-periods.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, Min } from 'class-validator';

export class UpdateTaskDto {
    @ApiProperty({
        example: 1,
        description: 'Task ID',
    })
    @IsNumber(null, { message: 'Must be a number' })
    public id?: number;

    @ApiProperty({
        example: 'Заправить кровать',
        description: 'Текст задания',
    })
    @IsString({ message: 'Must be a string' })
    public text?: string;

    @ApiProperty({
        example: 20,
        description: 'Продолжительность задания в минутах',
    })
    @IsNumber(null, { message: 'Must be a number' })
    public duration?: number;

    @ApiProperty({
        example: 1,
        description: 'ID категории задания',
    })
    @IsNumber(null, { message: 'Must be a number' })
    public categoryId?: number;

    @ApiProperty({
        example: true,
        description: 'Флаг активности',
    })
    @IsBoolean({ message: 'Должно быть булевым значением' })
    public isActive?: boolean;

    @ApiProperty({
        example: '2050-01-01',
        description: 'Дата, до которой задание будет активно',
    })
    @IsString({ message: 'Must be a string' })
    public endDate?: string;

    @ApiProperty({
        example: 1,
        description: 'Next task ID',
    })
    @Min(1, { message: 'Must be greater than zero' })
    @IsNumber(null, { message: 'Must be a number' })
    public nextTaskId?: number;

    @ApiProperty({
        example: 10,
        description: 'Break before next task in minutes',
    })
    @IsNumber(null, { message: 'Must be a number' })
    public nextTaskBreak?: number;

    @ApiProperty({
        example: 1,
        description: 'Previous task ID',
    })
    @Min(1, { message: 'Must be greater than zero' })
    @IsNumber(null, { message: 'Must be a number' })
    public previousTaskId?: number;

    @ApiProperty({
        example: 10,
        description: 'Break after previous task in minutes',
    })
    @IsNumber(null, { message: 'Must be a number' })
    public previousTaskBreak?: number;

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
    public periods?: UpdateTaskPeriodDto[];

    @ApiProperty({
        example: false,
        description: 'Флаг удалённого задания',
    })
    @IsBoolean({ message: 'Должно быть булевым значением' })
    public isDeleted?: boolean;
}
