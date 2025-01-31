import { Component, OnInit } from '@angular/core';
import { TaskService } from 'app/features/task/services/task.service';
import { Task } from '@backend/tasks/tasks.model';
import { ToastController } from '@ionic/angular';

@Component({
    selector: 'app-index-page',
    templateUrl: './index-page.component.html',
    styleUrls: ['./index-page.component.scss'],
    standalone: false,
})
export class IndexPageComponent implements OnInit {
    protected appointedTask: Task;
    protected loading = false;
    protected isMenuOpen = false;

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
        this.taskService.postpone(this.appointedTask).subscribe((result) => {
            if (result) {
                this.appoint();
            } else {
                this.presentToast('Ошибка при откладывании задания');
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
        this.taskService.reject(this.appointedTask).subscribe((a) => {
            if (a > 0) {
                this.appoint();
            } else {
                this.presentToast('Ошибка при отмене задания');
            }
        });
    }

    getCurrent(): void {
        this.taskService.getCurrent().subscribe((task) => {
            console.log(task);

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

    openMenu(a) {
        this.isMenuOpen = true;
        console.log('lalala');
    }

    closeMenu() {
        this.isMenuOpen = false;
        console.log('lalala');
    }
}
