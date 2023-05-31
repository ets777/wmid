import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { TaskService } from '../task.service';
import { CategoryService } from '../category.service';
import { PeriodService } from '../period.service';
import { GrowthService } from '../growth.service';
import { Category } from '../../classes/Category';
import { Period } from '../../classes/Period';
import { Task } from '../../classes/Task';
import { GrowthType } from '../../classes/GrowthType';
import { Growth } from '../../classes/Growth';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { Daily } from '../../classes/Daily';
import { Monthly } from '../../classes/Monthly';
import { Yearly } from '../../classes/Yearly';
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
  categories?: Category[] = [];
  tasks?: Task[] = [];
  periods?: Period[] = [];
  growthTypes?: GrowthType[] = [];

  addTaskForm: FormGroup = this.formBuilder.group({});
  weeklyFormGroup = this.formBuilder.group({
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
  onceFormGroup = this.formBuilder.group({
    date: undefined,
    hour: undefined,
    minute: undefined,
  });

  isChecked = true;

  constructor(
    private formBuilder: FormBuilder,
    private categoryService: CategoryService,
    private periodService: PeriodService,
    private taskService: TaskService,
    private growthService: GrowthService,
    private snackBar: MatSnackBar
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
  }

  ngOnInit(): void {
    this.categoryService
      .getCategories()
      .subscribe(a => (this.categories = a));

    this.periodService
      .getPeriods()
      .subscribe(a => (this.periods = a));

    this.updateTaskList();

    this.growthService
      .getGrowthTypes()
      .subscribe(a => (this.growthTypes = a));

    this.addGrowth();
  }

  onSubmit(): void {
    const task: Task = new Task();

    task.nextTaskId = +this.addTaskForm.value.nextTaskId;
    task.prevTaskId = +this.addTaskForm.value.prevTaskId;
    task.categoryId = +this.addTaskForm.value.categoryId;
    task.periodId = +this.addTaskForm.value.periodId;
    task.text = this.addTaskForm.value.text || '';
    task.offset = +this.addTaskForm.value.offset;
    task.duration = +this.addTaskForm.value.duration;
    task.cooldown = +this.addTaskForm.value.cooldown;
    task.nextTaskBreak = +this.addTaskForm.value.nextTaskBreak;
    task.active = this.addTaskForm.value.active;

    switch (task.periodId) {
      case 1:
        task.dailyData = [];
        this.addTaskForm.value.daily.forEach((element: Daily) => {
          task.dailyData?.push(element);
        });
        break;
      case 2:
        task.weeklyData = this.addTaskForm.value.weekly;
        break;
      case 3:
        task.monthlyData = [];
        this.addTaskForm.value.monthly.forEach((element: Monthly) => {
          task.monthlyData?.push(element);
        });
        break;
      case 4:
        task.yearlyData = [];
        this.addTaskForm.value.yearly.forEach((element: Yearly) => {
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
      this.addTaskForm.value.growth.forEach((element: Growth) => {
        task.growthData?.push(element);
      });
    }

    this.taskService
      .add(task)
      .subscribe(a => {
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

  onPeriodChange(a: any) {
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

  addDaily() {
    this.getPeriod('daily').push(
      this.formBuilder.group({
        hour: undefined,
        minute: undefined,
      })
    );
  }

  addMonthly() {
    this.getPeriod('monthly').push(
      this.formBuilder.group({
        day: undefined,
        hour: undefined,
        minute: undefined,
      })
    );
  }

  addYearly() {
    this.getPeriod('yearly').push(
      this.formBuilder.group({
        day: undefined,
        month: undefined,
        hour: undefined,
        minute: undefined,
      })
    );
  }

  addGrowth() {
    this.getGrowth().push(
      this.formBuilder.group({
        typeId: undefined,
        goal: undefined,
        step: undefined,
      })
    );
  }

  removeDaily(i: number) {
    this.getPeriod('daily').removeAt(i);
  }

  removeMonthly(i: number) {
    this.getPeriod('monthly').removeAt(i);
  }

  removeYearly(i: number) {
    this.getPeriod('yearly').removeAt(i);
  }

  removeGrowth(i: number) {
    this.getGrowth().removeAt(i);
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, undefined, {
      duration: 2500,
      panelClass: 'snackbar',
    });
  }

  byWeekdays() {
    return this.addTaskForm.value.weekly.byWeekdays;
  }

  updateTaskList() {
    this.taskService
      .getAll()
      .subscribe(a => (this.tasks = a?.data));
  }
}
