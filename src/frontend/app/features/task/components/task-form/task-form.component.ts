import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Task } from '@backend/tasks/tasks.model';
import { CreateTaskDto } from '@backend/tasks/dto/create-task.dto';
import { TaskCategory } from '@backend/task-categories/task-categories.model';
import { TaskService } from 'app/features/task/services/task.service';
import { TaskCategoryService } from 'app/features/task/services/task-category.service';
import { TaskPeriodType, taskPeriodTypes, weekdays, months } from '@backend/task-periods/task-periods.enum';
import { ModalController } from '@ionic/angular';
import { ConfirmModalComponent } from 'app/shared/modals/confirm-modal/confirm-modal.component';
import { sameTimeValidator } from 'app/features/task/validators/same-time.validator';
import { daysInMonthValidator } from 'app/features/task/validators/days-in-month.validator';
import { MaskitoElementPredicate, MaskitoOptions } from '@maskito/core';
import { maskitoTimeOptionsGenerator, maskitoDateOptionsGenerator } from '@maskito/kit';
import { Subject, takeUntil } from 'rxjs';
import { CreateTaskPeriodDto } from '@backend/task-periods/dto/create-task-period.dto';


interface IPeriodForm {
    uid: number;
    startTime: string;
    endTime: string;
    weekday: number;
    day: number;
    month: number;
    date: string;
    isImportant: boolean;
    offset: number;
    cooldown: number;
}

@Component({
    selector: 'app-task-form',
    templateUrl: './task-form.component.html',
    styleUrl: './task-form.component.scss',
    standalone: false,
})
export class TaskFormComponent implements OnInit, OnDestroy {
    private unsubscribe: Subject<void>;
    protected formTitle = '';
    protected taskForm: FormGroup;
    protected categories: TaskCategory[] = [];
    protected taskPeriodTypes = taskPeriodTypes;
    protected TaskPeriodType = TaskPeriodType;
    protected weekdays = weekdays;
    protected months = months;
    protected lastPeriodUid = 0;
    protected tasks: Task[] = [];
    protected previousPreviousTaskIdValue: number;
    protected previousNextTaskIdValue: number;
    protected previousDurationValue: number;
    protected arePeriodsLinked = true;
    readonly durationMask: MaskitoOptions = {
        mask: [/\d/, /\d/, ':', /[0-5]/, /\d/],
    };
    readonly timeMask: MaskitoOptions = maskitoTimeOptionsGenerator({
        mode: 'HH:MM',
    });
    readonly dateMask: MaskitoOptions = maskitoDateOptionsGenerator({
        mode: 'yyyy/mm/dd',
    });
    readonly maskPredicate: MaskitoElementPredicate =
        async (el) => (el as HTMLIonInputElement).getInputElement();

    constructor(
        private formBuilder: FormBuilder,
        private readonly taskCategoryService: TaskCategoryService,
        private readonly taskService: TaskService,
        private modalController: ModalController,
    ) {
        this.taskForm = this.formBuilder.group({
            text: [null, Validators.required],
            // startDate: [''],
            // endDate: [''],
            duration: [null, Validators.required],
            categoryId: [null, Validators.required],
            periodTypeId: [null, Validators.required],
            periods: this.formBuilder.array([], sameTimeValidator()),
            previousTaskId: [null, Validators.min(1)],
            previousTaskBreak: [null, Validators.min(0)],
            nextTaskId: [null, Validators.min(1)],
            nextTaskBreak: [null, Validators.min(0)],
            isPartOfChain: [false],
        });

        this.unsubscribe = new Subject<void>();
    }

    ngOnInit(): void {
        this.taskService.getAll()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((tasks: Task[]) => {
                this.tasks = tasks;
            });

        this.taskCategoryService.getCategories()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((categories: TaskCategory[]) => {
                this.categories = categories;
            });

        this.addPeriod();
    }

    ngOnDestroy(): void {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    get periodsForm(): FormArray {
        return this.taskForm.get('periods') as FormArray;
    }

    get previousTaskId(): number {
        return this.taskForm.value.previousTaskId;
    }

    get nextTaskId(): number {
        return this.taskForm.value.nextTaskId;
    }

    protected getAvailableNextTasks(): Task[] {
        return this.tasks.filter((task) => task.id !== this.previousTaskId);
    }

    protected getAvailablePreviousTasks(): Task[] {
        return this.tasks.filter((task) => task.id !== this.nextTaskId);
    }

    addPeriod(): void {
        this.periodsForm.push(
            this.formBuilder.group(
                {
                    uid: [this.lastPeriodUid],
                    startTime: [null],
                    endTime: [null],
                    weekday: [null, [Validators.min(1), Validators.max(7)]],
                    day: [null, [Validators.min(1), Validators.max(31)]],
                    month: [null, [Validators.min(1), Validators.max(12)]],
                    date: [null],
                    isImportant: [false],
                    offset: [null, Validators.min(0)],
                    cooldown: [null],
                },
                {
                    validators: daysInMonthValidator(),
                }
            ),
        );

        this.lastPeriodUid++;
    }

    removePeriod(periodUid: number): void {
        const periods = this.periodsForm.value;
        const index = periods.findIndex((period) => period.uid === periodUid);

        if (index !== -1) {
            this.periodsForm.removeAt(index);
        }
    }

    /**
     * TODO: reset values before hiding
     */
    getDateParamVisibility(dateParamName: string): boolean {
        const periodType = this.taskForm.value.periodTypeId;
        const isWeekly = periodType === TaskPeriodType.WEEKLY;
        const isMonthly = periodType === TaskPeriodType.MONTHLY;
        const isYearly = periodType === TaskPeriodType.YEARLY;
        const isOnce = periodType === TaskPeriodType.ONCE;
        const map = [
            { name: 'startTime', condition: true },
            { name: 'endTime', condition: true },
            { name: 'weekday', condition: isWeekly },
            { name: 'day', condition: isMonthly || isYearly },
            { name: 'month', condition: isYearly },
            { name: 'date', condition: isOnce },
        ];

        return map.find((item) => item.name === dateParamName)?.condition ?? false;
    }

    getPeriodFormGroup(periodUid: number): FormGroup {
        const periods = this.periodsForm.value;
        const index = periods.findIndex((period) => period.uid === periodUid);
        const periodGroup = this.periodsForm.at(index) as FormGroup;

        return periodGroup;
    }

    onSubmit(): void {
        const form = this.taskForm.value;
        const createTaskDto: CreateTaskDto = {
            text: form.text,
            duration: this.getMinutesFromTimeString(form.duration),
            categoryId: Number(form.categoryId) || null,
            nextTaskId: Number(form.nextTaskId) || null,
            nextTaskBreak: Number(form.nextTaskBreak) || null,
            previousTaskId: Number(form.previousTaskId) || null,
            previousTaskBreak: Number(form.previousTaskBreak) || null,
            isActive: true,
            periods: form.periods.map(
                (periodForm: IPeriodForm) => this.convertPeriodForm(periodForm)
            ),
        };

        this.taskService.add(createTaskDto).subscribe((response) => {
            console.log(response);
        });

        console.log(createTaskDto);
    }

    private convertPeriodForm(periodForm: IPeriodForm): CreateTaskPeriodDto {
        return {
            typeId: this.taskForm.value.periodTypeId,
            startTime: periodForm.startTime,
            endTime: periodForm.endTime,
            weekday: Number(periodForm.weekday) || null,
            day: Number(periodForm.day) || null,
            month: Number(periodForm.month) || null,
            date: periodForm.date,
            cooldown: Number(periodForm.cooldown) || null,
            isImportant: periodForm.isImportant,
        };
    }

    private getMinutesFromTimeString(time: string): number {
        const [hours, minutes] = time.split(':');

        return Number(hours) * 60 + Number(minutes);
    }

    getBreakTimeUnits(): string {
        switch (this.taskForm.value.periodTypeId) {
            case TaskPeriodType.DAILY:
                return '(hours)';
            case TaskPeriodType.WEEKLY:
            case TaskPeriodType.MONTHLY:
            case TaskPeriodType.YEARLY:
            case TaskPeriodType.ONCE:
                return '(days)';
            default:
                return '';
        }
    }

    async checkPreviousTask(e: CustomEvent): Promise<void> {
        const selectedTaskId = e.detail.value;
        const selectedTask = this.tasks.find(
            (task) => task.id === selectedTaskId
        );

        if (selectedTask.nextTaskId) {
            const modal = await this.modalController.create({
                component: ConfirmModalComponent,
                componentProps: {
                    text: `The selected task already has a next task "${this.getTaskText(selectedTask.nextTaskId)}". Are you sure you want to replace it with the current one?`,
                },
            });

            await modal.present();
            const { data: confirmed } = await modal.onWillDismiss();

            if (!confirmed) {
                this.taskForm.patchValue({ previousTaskId: this.previousPreviousTaskIdValue });
            }
        }

        this.previousPreviousTaskIdValue = this.previousTaskId;
    }

    // async openTimePicker(control: AbstractControl): Promise<void> {
    //     if (!control.value) {
    //         control.setValue('00:00');
    //     } else {
    //         control.setValue(control.value);
    //     }

    //     const modal = await this.modalController.create({
    //         component: TimePickerModalComponent,
    //         componentProps: {
    //             control,
    //         },
    //     });

    //     await modal.present();
    //     const { data: confirmed } = await modal.onWillDismiss();

    //     if (confirmed) {
    //         control.setValue(control.value);
    //     } else {
    //         control.setValue(this.previousDurationValue)
    //     }

    //     this.previousDurationValue = control.value;
    // }

    protected getTaskText(taskId: number): string {
        return this.tasks.find((task) => task.id == taskId).text;
    }

    protected changePeriodLinking(): void {
        this.arePeriodsLinked = !this.arePeriodsLinked;
    }

    protected getLinkIcon(): string {
        return this.arePeriodsLinked ? 'link-slash' : 'link';
    }

    protected onPeriodValueChanged(): void {
        console.log('arePeriodsLinked', this.arePeriodsLinked);

        if (!this.arePeriodsLinked) {
            return;
        }

        const firstPeriod = this.periodsForm.controls[0].value;

        console.log('firstPeriod', firstPeriod.startTime);
        console.log('this.periodsForm.controls', this.periodsForm.controls
            .filter((_, i) => i > 0));

        this.periodsForm.controls
            .filter((_, i) => i > 0)
            .forEach((control) => {
                control.patchValue({
                    startTime: firstPeriod.startTime,
                    endTime: firstPeriod.endTime,
                    isImportant: firstPeriod.isImportant,
                    cooldown: firstPeriod.cooldown,
                    offset: firstPeriod.offset,
                });

                control.markAsTouched();
            });
    }

    clearField(control: AbstractControl): void {
        control.setValue(null);
    }

    validateSameTime(period: AbstractControl): boolean {
        return this.periodsForm.hasError('timesNotMatching')
            && !period.value.date
            && !period.value.month
            && !period.value.day
            && !period.value.weekday;
    }
}
