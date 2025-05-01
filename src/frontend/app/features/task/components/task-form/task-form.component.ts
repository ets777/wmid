import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Task } from '@backend/tasks/tasks.model';
import { CreateTaskDto } from '@backend/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '@backend/tasks/dto/update-task.dto';
import { TaskCategory } from '@backend/task-categories/task-categories.model';
import { TaskService } from 'app/features/task/services/task.service';
import { TaskCategoryService } from 'app/features/task/services/task-category.service';
import { TaskPeriodType, taskPeriodTypes, weekdays, months, Weekday, IItem } from '@backend/task-periods/task-periods.enum';
import { ModalController } from '@ionic/angular';
import { ConfirmModalComponent } from 'app/shared/modals/confirm-modal/confirm-modal.component';
import { daysInMonthValidator } from 'app/features/task/validators/days-in-month.validator';
import { MaskitoElementPredicate, MaskitoOptions } from '@maskito/core';
import { maskitoTimeOptionsGenerator, maskitoDateOptionsGenerator } from '@maskito/kit';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { CreateTaskPeriodDto } from '@backend/task-periods/dto/create-task-period.dto';
import { ITask } from '@backend/tasks/tasks.interface';
import { UpdateTaskPeriodDto } from '@backend/task-periods/dto/update-task-period.dto';
import { Router } from '@angular/router';

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
}

@Component({
    selector: 'app-task-form',
    templateUrl: './task-form.component.html',
    styleUrl: './task-form.component.scss',
    standalone: false,
})
export class TaskFormComponent implements OnInit, OnDestroy {
    @Input() private task: ITask;

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
    protected readonly durationMask: MaskitoOptions = {
        mask: [/\d/, /\d/, ':', /[0-5]/, /\d/],
    };
    protected readonly timeMask: MaskitoOptions = maskitoTimeOptionsGenerator({
        mode: 'HH:MM',
    });
    protected readonly dateMask: MaskitoOptions = maskitoDateOptionsGenerator({
        mode: 'yyyy/mm/dd',
    });
    protected readonly maskPredicate: MaskitoElementPredicate =
        async (el) => (el as HTMLIonInputElement).getInputElement();

    constructor(
        private formBuilder: FormBuilder,
            private readonly taskCategoryService: TaskCategoryService,
        private readonly taskService: TaskService,
        private modalController: ModalController,
        private router: Router,
    ) {
        this.createForm();
        this.unsubscribe = new Subject<void>();
    }

    ngOnInit(): void {
        this.setData();

        if (this.isAddMode()) {
            this.addPeriod();
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    protected get periodsForm(): FormArray {
        return this.taskForm.get('periods') as FormArray;
    }

    protected get previousTaskId(): number {
        return this.taskForm.value.previousTaskId;
    }

    protected get nextTaskId(): number {
        return this.taskForm.value.nextTaskId;
    }

    private isAddMode(): boolean {
        return !this.task;
    }

    private isEditMode(): boolean {
        return Boolean(this.task?.id);
    }

    private isCopyMode(): boolean {
        return this.task && !this.task.id;
    }

    private setData(): void {
        forkJoin([
            this.taskService.getAll(),
            this.taskCategoryService.getCategories(),
        ])
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(([tasks, categories]: [Task[], TaskCategory[]]) => {
                this.categories = categories;
                this.tasks = tasks;

                this.fillForm();
                this.setPeriodsLinking();
            });
    }

    protected getAvailableNextTasks(): Task[] {
        return this.tasks.filter((task) => task.id !== this.previousTaskId);
    }

    protected getAvailablePreviousTasks(): Task[] {
        return this.tasks.filter((task) => task.id !== this.nextTaskId);
    }

    protected addPeriod(): void {
        const startTime = this.arePeriodsLinked
            ? this.periodsForm.controls[0]?.value?.startTime
            : null;
        const endTime = this.arePeriodsLinked
            ? this.periodsForm.controls[0]?.value?.endTime
            : null;

        this.periodsForm.push(
            this.formBuilder.group(
                {
                    uid: [this.lastPeriodUid],
                    startTime: [startTime],
                    endTime: [endTime],
                    weekday: [null, [Validators.min(1), Validators.max(7)]],
                    day: [null, [Validators.min(1), Validators.max(31)]],
                    month: [null, [Validators.min(1), Validators.max(12)]],
                    date: [null],
                    isImportant: [false],
                    offset: [null, Validators.min(0)],
                },
                {
                    validators: daysInMonthValidator(),
                },
            ),
        );

        this.lastPeriodUid++;
    }

    protected removePeriod(periodUid: number): void {
        const periods = this.periodsForm.value;
        const index = periods.findIndex((period) => period.uid === periodUid);

        if (index !== -1) {
            this.periodsForm.removeAt(index);
        }
    }

    /**
     * TODO: reset values before hiding
     */
    protected getDateParamVisibility(dateParamName: string): boolean {
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

    protected getPeriodFormGroup(periodUid: number): FormGroup {
        const periods = this.periodsForm.value;
        const index = periods.findIndex((period) => period.uid === periodUid);
        const periodGroup = this.periodsForm.at(index) as FormGroup;

        return periodGroup;
    }

    protected onSubmit(): void {
        if (this.isAddMode() || this.isCopyMode()) {
            this.addNewTask();
        }

        if (this.isEditMode()) {
            this.updateTask();
        }
    }

    private addNewTask(): void {
        const form = this.taskForm.value;
        const createTaskDto: CreateTaskDto = {
            text: form.text,
            duration: this.getMinutesFromTimeString(form.duration),
            categoryId: Number(form.categoryId) || null,
            nextTaskId: Number(form.nextTaskId) || null,
            nextTaskBreak: Number(form.nextTaskBreak) || null,
            previousTaskId: Number(form.previousTaskId) || null,
            previousTaskBreak: Number(form.previousTaskBreak) || null,
            cost: Number(form.cost) || null,
            cooldown: Number(form.cooldown) || null,
            isActive: true,
            willBeAppointedIfOverdue: Boolean(form.willBeAppointedIfOverdue),
            isReward: Boolean(form.isReward),
            periods: form.periods.flatMap(
                (periodForm: IPeriodForm) => this.convertPeriodFormForCreate(periodForm),
            ),
        };

        this.taskService.add(createTaskDto).subscribe((response) => {
            if (response?.id) {
                this.goToTaskList();
            }
        });
    }

    private goToTaskList(): void {
        this.router.navigate(['/task/list']);
    }

    private updateTask(): void {
        const form = this.taskForm.value;
        const updateTaskDto: UpdateTaskDto = {
            id: this.task.id,
            text: form.text,
            duration: this.getMinutesFromTimeString(form.duration),
            categoryId: Number(form.categoryId) || null,
            nextTaskId: Number(form.nextTaskId) || null,
            nextTaskBreak: Number(form.nextTaskBreak) || null,
            previousTaskId: Number(form.previousTaskId) || null,
            previousTaskBreak: Number(form.previousTaskBreak) || null,
            cost: Number(form.cost) || null,
            cooldown: Number(form.cooldown) || null,
            isActive: true,
            willBeAppointedIfOverdue: Boolean(form.willBeAppointedIfOverdue),
            isReward: Boolean(form.isReward),
            additionalTaskIds: form.additionalTaskIds,
            periods: form.periods.flatMap(
                (periodForm: IPeriodForm) => this.convertPeriodFormForUpdate(periodForm),
            ),
        };

        this.taskService.update(updateTaskDto).subscribe((response) => {
            if (response > 0) {
                this.goToTaskList();
            }
        });
    }

    private convertPeriodFormForUpdate(periodForm: IPeriodForm): UpdateTaskPeriodDto[] {
        const isDailyWithWeekdays = this.taskForm.value.periodTypeId === TaskPeriodType.DAILY
            && this.taskForm.value.showWeekdays
            && this.taskForm.value.weekdays;

        if (!isDailyWithWeekdays) {
            return [{
                id: periodForm.uid,
                typeId: this.taskForm.value.periodTypeId,
                startTime: periodForm.startTime || null,
                endTime: periodForm.endTime || null,
                weekday: Number(periodForm.weekday) || null,
                day: Number(periodForm.day) || null,
                month: Number(periodForm.month) || null,
                date: periodForm.date,
                isImportant: periodForm.isImportant,
                offset: Number(periodForm.offset),
            }];
        }

        // Get selected weekdays
        const selectedWeekdays = Object.entries(this.taskForm.value.weekdays)
            .filter(([_, isSelected]) => isSelected)
            .map(([weekdayId]) => Number(weekdayId));

        // Create a period for each selected weekday
        return selectedWeekdays.map(weekday => ({
            id: this.lastPeriodUid++,
            typeId: this.taskForm.value.periodTypeId,
            startTime: periodForm.startTime || null,
            endTime: periodForm.endTime || null,
            weekday: weekday,
            day: null,
            month: null,
            date: null,
            isImportant: periodForm.isImportant,
            offset: Number(periodForm.offset),
        }));
    }

    private convertPeriodFormForCreate(periodForm: IPeriodForm): CreateTaskPeriodDto[] {
        const isDailyWithWeekdays = this.taskForm.value.periodTypeId === TaskPeriodType.DAILY
            && this.taskForm.value.showWeekdays
            && this.taskForm.value.weekdays;

        if (!isDailyWithWeekdays) {
            return [{
                typeId: this.taskForm.value.periodTypeId,
                startTime: periodForm.startTime,
                endTime: periodForm.endTime,
                weekday: Number(periodForm.weekday) || null,
                day: Number(periodForm.day) || null,
                month: Number(periodForm.month) || null,
                date: periodForm.date,
                isImportant: periodForm.isImportant,
                offset: Number(periodForm.offset),
            }];
        }

        // Get selected weekdays
        const selectedWeekdays = Object.entries(this.taskForm.value.weekdays)
            .filter(([_, isSelected]) => isSelected)
            .map(([weekdayId]) => Number(weekdayId));

        // Create a period for each selected weekday
        return selectedWeekdays.map(weekday => ({
            typeId: this.taskForm.value.periodTypeId,
            startTime: periodForm.startTime,
            endTime: periodForm.endTime,
            weekday: weekday,
            day: null,
            month: null,
            date: null,
            isImportant: periodForm.isImportant,
        }));
    }

    private getMinutesFromTimeString(time: string): number {
        const [hours, minutes] = time.split(':');

        return Number(hours) * 60 + Number(minutes);
    }

    private getTimeStringFromMinutes(totalMinutes: number): string {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes - hours * 60;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    protected getBreakTimeUnits(): string {
        switch (this.taskForm.value.periodTypeId) {
            case TaskPeriodType.DAILY:
                return '(minutes)';
            case TaskPeriodType.WEEKLY:
            case TaskPeriodType.MONTHLY:
            case TaskPeriodType.YEARLY:
            case TaskPeriodType.ONCE:
                return '(days)';
            default:
                return '';
        }
    }

    protected async checkPreviousTask(e: CustomEvent): Promise<void> {
        const selectedTaskId = e.detail.value;
        const selectedTask = this.tasks.find(
            (task) => task.id === selectedTaskId,
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

        this.fillPeriodsTimeFromFirstPeriod();
    }

    private setPeriodsLinking(): void {
        if (!this.task?.periods || this.task.periods.length <= 1) {
            this.arePeriodsLinked = true;
            return;
        }

        const firstPeriod = this.task.periods[0];
        this.arePeriodsLinked = this.task.periods.every(
            (period) =>
                period.startTime === firstPeriod.startTime
                && period.endTime === firstPeriod.endTime
                && period.isImportant === firstPeriod.isImportant
                && period.offset === firstPeriod.offset
                && (period.weekday === firstPeriod.weekday || this.isDailyWithWeekday()),
        );
    }

    private fillPeriodsTimeFromFirstPeriod(): void {
        if (!this.periodsForm.length || !this.arePeriodsLinked) {
            return;
        }

        const firstPeriod = this.periodsForm.controls[0].value;

        this.periodsForm.controls
            .filter((_, i) => i > 0)
            .forEach((control) => {
                control.patchValue({
                    startTime: firstPeriod.startTime,
                    endTime: firstPeriod.endTime,
                    isImportant: firstPeriod.isImportant,
                    offset: firstPeriod.offset,
                });

                control.markAsTouched();
            });
    }

    private deleteSeconds(time: string): string {
        if (!time) {
            return;
        }

        const [hours, minutes] = time.split(':');

        return `${hours}:${minutes}`;
    }

    protected getLinkIcon(): string {
        return this.arePeriodsLinked ? 'link-slash' : 'link';
    }

    protected onPeriodValueChanged(): void {
        this.fillPeriodsTimeFromFirstPeriod();
    }

    protected clearField(control: AbstractControl): void {
        control.setValue(null);
    }

    private createForm(): void {
        const weekdayControls = this.getWeekdayFormGroupValues(() => true);

        this.taskForm = this.formBuilder.group({
            text: [null, Validators.required],
            // startDate: [''],
            // endDate: [''],
            duration: [null, Validators.required],
            categoryId: [null, Validators.required],
            periodTypeId: [null, Validators.required],
            periods: this.formBuilder.array([]),
            previousTaskId: [null, Validators.min(1)],
            previousTaskBreak: [null, Validators.min(0)],
            nextTaskId: [null, Validators.min(1)],
            nextTaskBreak: [null, Validators.min(0)],
            isPartOfChain: [false],
            showWeekdays: [false],
            weekdays: this.formBuilder.group(weekdayControls),
            cost: [null, Validators.min(0)],
            cooldown: [null, Validators.min(0)],
            isReward: [false],
            willBeAppointedIfOverdue: [false],
            additionalTaskIds: [[]],
        });
    }

    isDailyWithWeekday(): boolean {
        const isDailyWithWeekday = this.task.periods.some(
            (period) => period.typeId === TaskPeriodType.DAILY && period.weekday,
        );

        return isDailyWithWeekday;
    }

    getWeekdayFormGroupValuesToFill(weekdays: Weekday[] = null): unknown {
        if (weekdays) {
            return this.getWeekdayFormGroupValues(
                (weekday) => weekdays.includes(weekday.id),
            );
        }

        return this.getWeekdayFormGroupValues(() => true);
    }

    getWeekdayFormGroupValues(getValue: (weekday: IItem) => boolean): unknown {
        return this.weekdays.reduce(
            (acc, weekday) => ({
                ...acc,
                [weekday.id.toString()]: [getValue(weekday)],
            }),
            {},
        );
    }

    getPeriodFormArrayValuesToFill(): unknown[] {
        const weekdays = this.getWeekdaysFromPeriodsToFill();

        return this.task.periods
            .filter(
                (period) => !this.isDailyWithWeekday()
                    || period.weekday == weekdays[0],
            )
            .map(
                (period) => this.formBuilder.group(
                    {
                        uid: [period.id],
                        startTime: this.deleteSeconds(period.startTime),
                        endTime: this.deleteSeconds(period.endTime),
                        weekday: [
                            this.isDailyWithWeekday()
                                ? null
                                : period.weekday, [Validators.min(1), Validators.max(7)],
                        ],
                        day: [period.day ?? null, [Validators.min(1), Validators.max(31)]],
                        month: [period.month ?? null, [Validators.min(1), Validators.max(12)]],
                        date: [period.date ?? null],
                        isImportant: [period.isImportant ?? false],
                        offset: [period.offset ?? null, Validators.min(0)],
                    },
                    {
                        validators: daysInMonthValidator(),
                    },
                ),
            );
    }

    getWeekdaysFromPeriodsToFill(): Weekday[] | null {
        const weekdays = this.isDailyWithWeekday()
            ? [...new Set(this.task.periods.map((period) => period.weekday))]
            : null;

        return weekdays;
    }

    private fillForm(): void {
        if (this.isAddMode()) {
            return;
        }

        const weekdays = this.getWeekdaysFromPeriodsToFill();
        const weekdayFormGroupValues = this.getWeekdayFormGroupValuesToFill(weekdays);
        const periods = this.getPeriodFormArrayValuesToFill();

        this.lastPeriodUid = this.getMaxPeriodId() + 1;

        this.taskForm = this.formBuilder.group({
            text: [this.task.text, Validators.required],
            // startDate: [''],
            // endDate: [''],
            duration: [this.getTimeStringFromMinutes(this.task.duration), Validators.required],
            categoryId: [this.task.categoryId, Validators.required],
            periodTypeId: [this.task.periods[0].typeId, Validators.required],
            periods: this.formBuilder.array(periods),
            previousTaskId: [this.task.previousTask?.id, Validators.min(1)],
            previousTaskBreak: [this.task.previousTask?.nextTaskBreak, Validators.min(0)],
            nextTaskId: [this.task.nextTaskId, Validators.min(1)],
            nextTaskBreak: [this.task.nextTaskBreak, Validators.min(0)],
            isPartOfChain: [Boolean(this.task.nextTaskId || this.task.previousTask)],
            showWeekdays: [this.isDailyWithWeekday()],
            weekdays: this.formBuilder.group(weekdayFormGroupValues),
            cost: [this.task.cost, Validators.min(0)],
            cooldown: [this.task.cooldown, Validators.min(0)],
            isReward: [this.task.isReward],
            willBeAppointedIfOverdue: [this.task.willBeAppointedIfOverdue],
            additionalTaskIds: [
                this.task.additionalTasks.map((additionalTask) => additionalTask.id),
            ],
        });
    }

    private getMaxPeriodId(): number {
        const ids = this.task.periods.map((period) => period.id);

        return Math.max(...ids);
    }

    protected toggleWeekdays(event: CustomEvent): void {
        const isChecked = event.detail.checked;
        const weekdaysGroup = this.taskForm.get('weekdays');
        this.weekdays.forEach(weekday => {
            weekdaysGroup.get(weekday.id.toString()).setValue(isChecked);
        });
    }

    protected getAvailableAdditionalTasks(): ITask[] {
        return this.tasks.filter((task) => task.id !== this.task.id);
    }
}
