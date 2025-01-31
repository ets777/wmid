import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import {
    Month,
    TaskPeriodType,
    Weekday,
} from '@backend/task-periods/task-periods.enum';
export class CreateTaskPeriodDto {
    @ApiProperty({
        example: 1,
        description: 'ID типа периода',
    })
    @IsNumber(null, { message: 'Must be a number' })
    typeId: TaskPeriodType;

    @ApiProperty({
        example: '07:58:00',
        description: 'Время начала действия периода',
    })
    @IsString({ message: 'Должно быть строкой' })
    startTime?: string;

    @ApiProperty({
        example: '17:58:00',
        description: 'Время окончания действия периода',
    })
    @IsString({ message: 'Должно быть строкой' })
    endTime?: string;

    @ApiProperty({
        example: 1,
        description: 'День недели действия периода',
    })
    @IsNumber(null, { message: 'Must be a number' })
    weekday?: Weekday;

    @ApiProperty({
        example: 1,
        description: 'День месяца действия периода',
    })
    @IsNumber(null, { message: 'Must be a number' })
    day?: number;

    @ApiProperty({
        example: 1,
        description: 'Месяц действия периода',
    })
    @IsNumber(null, { message: 'Must be a number' })
    month?: Month;

    @ApiProperty({
        example: '2024-10-28',
        description: 'Дата действия периода',
    })
    @IsString({ message: 'Должно быть строкой' })
    date?: string;

    @ApiProperty({
        example: 2,
        description:
            'Перерыв до следующего назначения. Единицы зависят от периодичности задания. Часы для ежедневного, дни для еженедельного, недели для ежемесячного, месяцы для годового.',
    })
    @IsNumber(null, { message: 'Must be a number' })
    cooldown?: number;

    @ApiProperty({
        example: false,
        description: 'Флаг важности',
    })
    @IsBoolean({ message: 'Должно быть булевым значением' })
    isImportant?: boolean;

    @ApiProperty({
        example: 1,
        description: 'ID задания',
    })
    @IsNumber(null, { message: 'Must be a number' })
    taskId?: number;
}


// {
//             "uid": 0,
//             "startTime": null,
//             "endTime": null,
//             "weekday": null,
//             "day": null,
//             "month": null,
//             "date": null,
//             "isImportant": false,
//             "offset": null,
//             "cooldown": null
//         }