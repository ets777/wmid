import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { TaskService } from '../../service/task.service';
import { TaskCategoryService } from '../../service/task-category.service';
import { PeriodService } from '../../service/period.service';
import { GrowthService } from '../../service/growth.service';
import { ICategory } from '../../interface/category.interface';
import { IPeriodType } from '../../interface/period-type.interface';
import { ITask } from '../../interface/task.interface';
import { IGrowthType } from '../../interface/growth-type.interface';
import { IGrowth } from '../../interface/growth.interface';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { IDaily } from '../../interface/daily.interface';
import { IMonthly } from '../../interface/monthly.interface';
import { IYearly } from '../../interface/yearly.interface';
import { MatSnackBar } from '@angular/material/snack-bar';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD.MM.YYYY',
    monthYearA11yLabel: 'DD.MM.YYYY',
  },
};

@Component({
  selector: 'app-task-add-page',
  templateUrl: './task-add-page.component.html',
  styleUrls: ['./task-add-page.component.sass'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_LOCALE, useValue: 'ru-RU' },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class TaskAddPageComponent implements OnInit {
  categories?: ICategory[] = [];
  tasks?: ITask[] = [];
  periods?: IPeriodType[] = [];
  growthTypes?: IGrowthType[] = [];
  addTaskForm: FormGroup;
  weeklyFormGroup: FormGroup;
  onceFormGroup: FormGroup;

  isChecked = true;

  constructor(
    private formBuilder: FormBuilder,
    private taskCategoryService: TaskCategoryService,
    private periodService: PeriodService,
    private taskService: TaskService,
    private growthService: GrowthService,
    private snackBar: MatSnackBar,
  ) {
    this.addTaskForm = this.formBuilder.group({
      text: '',
      categoryId: 0,
      nextTaskId: undefined,
      prevTaskId: undefined,
      periodId: 0,
      offset: undefined,
      duration: undefined,
      cooldown: undefined,
      nextTaskBreak: undefined,
      active: false,
      daily: this.formBuilder.array([]),
      weekly: this.weeklyFormGroup,
      monthly: this.formBuilder.array([]),
      yearly: this.formBuilder.array([]),
      once: this.onceFormGroup,
      growth: this.formBuilder.array([]),
    });

    this.onceFormGroup = this.formBuilder.group({
      date: undefined,
      hour: undefined,
      minute: undefined,
    });

    this.weeklyFormGroup = this.formBuilder.group({
      byWeekdays: false,
      periods: 0,
      monday: false,
      thuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
      hour: undefined,
      minute: undefined,
    });
  }

  ngOnInit(): void {
    this.taskCategoryService
      .getCategories()
      .subscribe((a) => (this.categories = a));

    this.periods = this.periodService.getPeriodTypes();

    this.updateTaskList();

    this.growthService
      .getGrowthTypes()
      .subscribe((a) => (this.growthTypes = a));

    this.addGrowth();
  }

  onSubmit(): void {
    const task: ITask = {
      nextTaskId: +this.addTaskForm.value.nextTaskId,
      prevTaskId: +this.addTaskForm.value.prevTaskId,
      categoryId: +this.addTaskForm.value.categoryId,
      periodId: +this.addTaskForm.value.periodId,
      text: this.addTaskForm.value.text || '',
      offset: +this.addTaskForm.value.offset,
      duration: +this.addTaskForm.value.duration,
      cooldown: +this.addTaskForm.value.cooldown,
      nextTaskBreak: +this.addTaskForm.value.nextTaskBreak,
      active: this.addTaskForm.value.active,
    };

    switch (task.periodId) {
      case 1:
        task.dailyData = [];
        this.addTaskForm.value.daily.forEach((element: IDaily) => {
          task.dailyData?.push(element);
        });
        break;
      case 2:
        task.weeklyData = this.addTaskForm.value.weekly;
        break;
      case 3:
        task.monthlyData = [];
        this.addTaskForm.value.monthly.forEach((element: IMonthly) => {
          task.monthlyData?.push(element);
        });
        break;
      case 4:
        task.yearlyData = [];
        this.addTaskForm.value.yearly.forEach((element: IYearly) => {
          task.yearlyData?.push(element);
        });
        break;
      case 5:
        task.onceData = this.addTaskForm.value.once;
        if (task.onceData && this.addTaskForm.value.once.date) {
          console.log(this.addTaskForm.value.once.date);
          task.onceData.date =
            this.addTaskForm.value.once.date.format('YYYY-MM-DD');
        }
        break;
    }

    if (this.addTaskForm.value.growth.length > 0) {
      task.growthData = [];
      this.addTaskForm.value.growth.forEach((element: IGrowth) => {
        task.growthData?.push(element);
      });
    }

    this.taskService.add(task).subscribe((a) => {
      if (a) {
        this.addTaskForm.reset();
        this.updateTaskList();
        this.openSnackBar('Добавлено');
      } else {
        this.openSnackBar('Ошибка!');
      }
    });
  }

  getPeriod(periodType: string): FormArray {
    return this.addTaskForm.get(periodType) as FormArray;
  }

  getGrowth(): FormArray {
    return this.addTaskForm.get('growth') as FormArray;
  }

  onPeriodChange(a: any): void {
    switch (a) {
      case '1':
        this.addDaily();
        break;
      case '3':
        this.addMonthly();
        break;
      case '4':
        this.addYearly();
        break;
    }
  }

  addDaily(): void {
    this.getPeriod('daily').push(
      this.formBuilder.group({
        hour: undefined,
        minute: undefined,
      }),
    );
  }

  addMonthly(): void {
    this.getPeriod('monthly').push(
      this.formBuilder.group({
        day: undefined,
        hour: undefined,
        minute: undefined,
      }),
    );
  }

  addYearly(): void {
    this.getPeriod('yearly').push(
      this.formBuilder.group({
        day: undefined,
        month: undefined,
        hour: undefined,
        minute: undefined,
      }),
    );
  }

  addGrowth(): void {
    this.getGrowth().push(
      this.formBuilder.group({
        typeId: undefined,
        goal: undefined,
        step: undefined,
      }),
    );
  }

  removeDaily(i: number): void {
    this.getPeriod('daily').removeAt(i);
  }

  removeMonthly(i: number): void {
    this.getPeriod('monthly').removeAt(i);
  }

  removeYearly(i: number): void {
    this.getPeriod('yearly').removeAt(i);
  }

  removeGrowth(i: number): void {
    this.getGrowth().removeAt(i);
  }

  openSnackBar(message: string): void {
    this.snackBar.open(message, undefined, {
      duration: 2500,
      panelClass: 'snackbar',
    });
  }

  byWeekdays(): any {
    return this.addTaskForm.value.weekly.byWeekdays;
  }

  updateTaskList(): void {
    this.taskService.getAll().subscribe((a) => (this.tasks = a?.data));
  }
}
