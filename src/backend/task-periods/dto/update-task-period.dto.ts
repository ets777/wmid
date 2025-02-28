import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import {
    Month,
    TaskPeriodType,
    Weekday,
} from '@backend/task-periods/task-periods.enum';

export class UpdateTaskPeriodDto {
    @ApiProperty({
        example: 1,
        description: 'Task period ID',
    })
    @IsNumber(null, { message: 'Must be a number' })
    public id?: number;

    @ApiProperty({
        example: 1,
        description: 'ID типа периода',
    })
    @IsNumber(null, { message: 'Must be a number' })
    public typeId: TaskPeriodType;

    @ApiProperty({
        example: '07:58:00',
        description: 'Время начала действия периода',
    })
    @IsString({ message: 'Must be a string' })
    public startTime?: string;

    @ApiProperty({
        example: '17:58:00',
        description: 'Время окончания действия периода',
    })
    @IsString({ message: 'Must be a string' })
    public endTime?: string;

    @ApiProperty({
        example: 1,
        description: 'День недели действия периода',
    })
    @IsNumber(null, { message: 'Must be a number' })
    public weekday?: Weekday;

    @ApiProperty({
        example: 1,
        description: 'День месяца действия периода',
    })
    @IsNumber(null, { message: 'Must be a number' })
    public day?: number;

    @ApiProperty({
        example: 1,
        description: 'Месяц действия периода',
    })
    @IsNumber(null, { message: 'Must be a number' })
    public month?: Month;

    @ApiProperty({
        example: '2024-10-28',
        description: 'Дата действия периода',
    })
    @IsString({ message: 'Must be a string' })
    public date?: string;

    @ApiProperty({
        example: 2,
        description:
            'Перерыв до следующего назначения. Единицы зависят от периодичности задания. Часы для ежедневного, дни для еженедельного, недели для ежемесячного, месяцы для годового.',
    })
    @IsNumber(null, { message: 'Must be a number' })
    public cooldown?: number;

    @ApiProperty({
        example: false,
        description: 'Флаг важности',
    })
    @IsBoolean({ message: 'Должно быть булевым значением' })
    public isImportant?: boolean;

    @ApiProperty({
        example: 1,
        description: 'ID задания',
    })
    @IsNumber(null, { message: 'Must be a number' })
    public taskId?: number;
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