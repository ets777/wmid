import { Component, OnInit } from '@angular/core';
import { TaskService } from 'app/features/task/api-services/task-api.service';
import { ToastController } from '@ionic/angular';
import { TaskAddPageComponent } from 'app/features/task/pages/task-add-page/task-add-page.component';
import { ITask } from '@backend/tasks/tasks.interface';

@Component({
    selector: 'app-task-random',
    templateUrl: './task-random.component.html',
    styleUrls: ['./task-random.component.scss'],
    standalone: false,
})
export class TaskRandomComponent implements OnInit {
    protected appointedTask: ITask;
    protected loading = false;
    protected isCompleteMenuOpen = false;
    protected isPostponeMenuOpen = false;
    protected postponeMinutes = 30;
    protected taskAddPageComponent = TaskAddPageComponent;

    constructor(
        private taskService: TaskService,
        private toastController: ToastController,
    ) { }

    ngOnInit(): void {
        this.getCurrent();
    }

    complete(): void {
        this.taskService.complete(this.appointedTask).subscribe((result) => {
            if (result) {
                this.appointedTask = null;
            } else {
                this.presentToast('Ошибка при выполнении задания');
            }
        });
    }

    completeAndAppoint(): void {
        this.taskService.complete(this.appointedTask).subscribe((result) => {
            if (result) {
                this.appoint();
            } else {
                this.presentToast('Ошибка при выполнении задания');
            }
        });
    }

    postpone(): void {
        if (!this.postponeMinutes || this.postponeMinutes < 1) {
            this.presentToast('Please enter valid number of minutes');
            return;
        }

        this.taskService.postpone(this.appointedTask, this.postponeMinutes)
            .subscribe((result) => {
                if (result) {
                    this.closePostponeMenu();
                    this.appoint();
                } else {
                    this.presentToast('Error while postponing task');
                }
            });
    }

    appoint(): void {
        this.loading = true;

        this.taskService.appoint().subscribe((appointedTask) => {
            this.loading = false;

            if (appointedTask?.text) {
                this.presentToast('Задание успешно назначено');
                this.appointedTask = appointedTask;
            } else {
                this.presentToast('Заданий нет');
                this.appointedTask = null;
            }
        });
    }

    reject(): void {
        this.taskService.reject(this.appointedTask)
            .subscribe((affectedRows) => {
                if (affectedRows > 0) {
                    this.appoint();
                } else {
                    this.presentToast('Error while rejecting');
                }
            });
    }

    getCurrent(): void {
        this.taskService.getCurrent().subscribe((task) => {
            if (task) {
                this.appointedTask = task;
            } else if (task !== null) {
                this.presentToast('Ошибка при получении задания');
            }
        });
    }

    // checkAdditionalTask(a: any, appointmentId: any): void {
    //     const i = this.appointedTask.additionalTasks.findIndex(
    //         (a) => a.appointmentId == appointmentId,
    //     );
    //     this.appointedTask.additionalTasks[i].isCompleted = a.checked;
    // }

    async presentToast(message: string): Promise<void> {
        const toast = await this.toastController.create({
            message,
            duration: 2000,
            position: 'bottom',
            color: 'primary',
        });
        await toast.present();
    }

    openCompleteMenu(_event: MouseEvent): void {
        this.isCompleteMenuOpen = true;
    }

    closeCompleteMenu(): void {
        this.isCompleteMenuOpen = false;
    }

    openPostponeMenu(_event: MouseEvent): void {
        this.isPostponeMenuOpen = true;
    }

    closePostponeMenu(): void {
        this.isPostponeMenuOpen = false;
    }
}
