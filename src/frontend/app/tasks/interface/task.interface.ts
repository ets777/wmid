import { IDaily } from './daily.interface';
import { IWeekly } from './weekly.interface';
import { IMonthly } from './monthly.interface';
import { IYearly } from './yearly.interface';
import { IOnce } from './once.interface';
import { IGrowth } from './growth.interface';

export class ITask {
  text: string;
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
  dailyData?: IDaily[];
  weeklyData?: IWeekly;
  monthlyData?: IMonthly[];
  yearlyData?: IYearly[];
  onceData?: IOnce;
  growthData?: IGrowth[];
  additionalTasks?: Task[];
}
