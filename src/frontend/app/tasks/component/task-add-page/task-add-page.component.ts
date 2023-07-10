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
import { TaskPeriodType } from '@backend/task-periods/task-periods.enum';
import { CreateTaskControllerDto } from '@backend/tasks/dto/create-task-controller.dto';
import { weekdays, months } from '@backend/task-periods/task-periods.enum';
import { IWeekly } from 'app/tasks/interface/weekly.interface';
import { IOnce } from 'app/tasks/interface/once.interface';

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
  periodTypes?: IPeriodType[] = [];
  growthTypes?: IGrowthType[] = [];
  addTaskForm: FormGroup;
  weekdays = weekdays;
  months = months;

  constructor(
    private formBuilder: FormBuilder,
    private taskCategoryService: TaskCategoryService,
    private periodService: PeriodService,
    private taskService: TaskService,
    private growthService: GrowthService,
    private snackBar: MatSnackBar,
  ) {
    this.addTaskForm = this.formBuilder.group<ITask>({
      text: '',
      categoryId: 0,
      nextTaskId: undefined,
      prevTaskId: undefined,
      periodTypeId: 0,
      offset: undefined,
      duration: undefined,
      cooldown: undefined,
      nextTaskBreak: undefined,
      active: false,
      daily: this.formBuilder.array<IDaily[]>([]),
      weekly: this.formBuilder.array<IWeekly[]>([]),
      monthly: this.formBuilder.array<IMonthly[]>([]),
      yearly: this.formBuilder.array<IYearly[]>([]),
      once: this.formBuilder.array<IOnce[]>([]),
      growth: this.formBuilder.array<IGrowth>([]),
    });
  }

  ngOnInit(): void {
    this.taskCategoryService
      .getCategories()
      .subscribe((a) => (this.categories = a));

    this.periodTypes = this.periodService.getPeriodTypes();

    this.updateTaskList();

    this.growthService
      .getGrowthTypes()
      .subscribe((a) => (this.growthTypes = a));

    this.addGrowth();
  }

  onSubmit(): void {
    const formData = this.addTaskForm.value;
    const task: CreateTaskControllerDto = {
      text: formData.text,
      duration: parseInt(formData.duration, 10),
      categoryId: parseInt(formData.categoryId, 10),
      active: !!formData.active,
      periods: [],
    };

    if (formData.nextTaskId) {
      task.nextTaskId = parseInt(formData.nextTaskId, 10);
    }

    if (formData.offset) {
      task.offset = parseInt(formData.offset, 10);
    }

    if (formData.cooldown) {
      task.cooldown = parseInt(formData.cooldown, 10);
    }

    if (formData.nextTaskBreak) {
      task.nextTaskBreak = parseInt(formData.nextTaskBreak, 10);
    }

    switch (formData.periodTypeId) {
      case TaskPeriodType.DAILY:
        formData.daily.forEach((element: IDaily) => {
          task.periods.push({
            typeId: TaskPeriodType.DAILY,
            startTime: element.startTime,
            endTime: element.endTime,
          });
        });
        break;
      case TaskPeriodType.WEEKLY:
        formData.weekly.forEach((element: IWeekly) => {
          task.periods.push({
            typeId: TaskPeriodType.WEEKLY,
            startTime: element.startTime,
            endTime: element.endTime,
            weekday: element.weekday,
          });
        });
        break;
      case TaskPeriodType.MONTHLY:
        formData.monthly.forEach((element: IMonthly) => {
          task.periods.push({
            typeId: TaskPeriodType.MONTHLY,
            startTime: element.startTime,
            endTime: element.endTime,
            day: element.day,
          });
        });
        break;
      case TaskPeriodType.YEARLY:
        formData.yearly.forEach((element: IYearly) => {
          task.periods.push({
            typeId: TaskPeriodType.YEARLY,
            startTime: element.startTime,
            endTime: element.endTime,
            day: element.day,
            month: element.month,
          });
        });
        break;
      case TaskPeriodType.ONCE:
        formData.once.forEach((element: IOnce) => {
          task.periods.push({
            typeId: TaskPeriodType.YEARLY,
            startTime: element.startTime,
            endTime: element.endTime,
            date: element.date,
          });
        });
        break;
    }

    //this.addTaskForm.value.once.date.format('YYYY-MM-DD');

    // if (this.addTaskForm.value.growth.length > 0) {
    //   task.growthData = [];
    //   this.addTaskForm.value.growth.forEach((element: IGrowth) => {
    //     task.growthData?.push(element);
    //   });
    // }

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

  onPeriodTypeChange(periodType: TaskPeriodType): void {
    console.log('test');
    switch (periodType) {
      case TaskPeriodType.DAILY:
        if (this.getPeriod('daily').length === 0) this.addDaily();
        break;
      case TaskPeriodType.WEEKLY:
        if (this.getPeriod('weekly').length === 0) this.addWeekly();
        break;
      case TaskPeriodType.MONTHLY:
        if (this.getPeriod('monthly').length === 0) this.addMonthly();
        break;
      case TaskPeriodType.YEARLY:
        if (this.getPeriod('yearly').length === 0) this.addYearly();
        break;
      case TaskPeriodType.ONCE:
        if (this.getPeriod('once').length === 0) this.addOnce();
        break;
    }
  }

  addDaily(): void {
    this.getPeriod('daily').push(
      this.formBuilder.group<IDaily>({
        startTime: undefined,
        endTime: undefined,
      }),
    );
  }

  addWeekly(): void {
    this.getPeriod('weekly').push(
      this.formBuilder.group<IWeekly>({
        startTime: undefined,
        endTime: undefined,
        weekday: undefined,
      }),
    );
  }

  addMonthly(): void {
    this.getPeriod('monthly').push(
      this.formBuilder.group<IMonthly>({
        day: undefined,
        startTime: undefined,
        endTime: undefined,
      }),
    );
  }

  addYearly(): void {
    this.getPeriod('yearly').push(
      this.formBuilder.group<IYearly>({
        day: undefined,
        month: undefined,
        startTime: undefined,
        endTime: undefined,
      }),
    );
  }

  addOnce(): void {
    this.getPeriod('once').push(
      this.formBuilder.group<IOnce>({
        date: undefined,
        startTime: undefined,
        endTime: undefined,
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

  removeWeekly(i: number): void {
    this.getPeriod('weekly').removeAt(i);
  }

  removeMonthly(i: number): void {
    this.getPeriod('monthly').removeAt(i);
  }

  removeYearly(i: number): void {
    this.getPeriod('yearly').removeAt(i);
  }

  removeOnce(i: number): void {
    this.getPeriod('once').removeAt(i);
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

  byWeekdays(): boolean {
    return this.addTaskForm.value.weekly?.byWeekdays;
  }

  updateTaskList(): void {
    this.taskService.getAll().subscribe((a) => (this.tasks = a));
  }

  isDaily(periodType: TaskPeriodType): boolean {
    return periodType === TaskPeriodType.DAILY;
  }

  isWeekly(periodType: TaskPeriodType): boolean {
    return periodType === TaskPeriodType.WEEKLY;
  }

  isMonthly(periodType: TaskPeriodType): boolean {
    return periodType === TaskPeriodType.MONTHLY;
  }

  isYearly(periodType: TaskPeriodType): boolean {
    return periodType === TaskPeriodType.YEARLY;
  }

  isOnce(periodType: TaskPeriodType): boolean {
    return periodType === TaskPeriodType.ONCE;
  }
}
