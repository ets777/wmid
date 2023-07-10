import { IDaily } from './daily.interface';
import { IWeekly } from './weekly.interface';
import { IMonthly } from './monthly.interface';
import { IYearly } from './yearly.interface';
import { IOnce } from './once.interface';
import { IGrowth } from './growth.interface';
import { FormArray, FormControl } from '@angular/forms';

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
  periodTypeId?: number;
  daily?: IDaily[] | FormArray<FormControl<IDaily>>;
  weekly?: IWeekly[] | FormArray<FormControl<IWeekly>>;
  monthly?: IMonthly[] | FormArray<FormControl<IMonthly>>;
  yearly?: IYearly[] | FormArray<FormControl<IYearly>>;
  once?: IOnce[] | FormArray<FormControl<IOnce>>;
  growth?: IGrowth[] | FormArray<FormControl<IGrowth>>;
  additionalTasks?: Task[];
}
