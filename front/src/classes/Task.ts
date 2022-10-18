import { Daily } from './Daily';
import { Weekly } from './Weekly';
import { Monthly } from './Monthly';
import { Yearly } from './Yearly';
import { Once } from './Once';
import { Growth } from './Growth';

export class Task {
    text: string = '';
    id?: number;
    statusId?: number;
    nextTaskId?: number;
    prevTaskId?: number;
    appointmentId?: number;
    categoryId?: number;
    offset?: number;
    duration?: number;
    cooldown?: number;
    nextTaskBreak?: number;
    active?: boolean;
    periodId?: number;
    dailyData?: Daily[];
    weeklyData?: Weekly;
    monthlyData?: Monthly[];
    yearlyData?: Yearly[];
    onceData?: Once;
    growthData?: Growth[];
    additionalTasks?: Task[];
}
