import { Component, OnInit } from '@angular/core';
import { TaskService } from 'app/features/task/api-services/task-api.service';
import { ITask } from '@backend/tasks/tasks.interface';
import { ToastController } from '@ionic/angular';

@Component({
    selector: 'app-task-store',
    templateUrl: './task-store.component.html',
    styleUrl: './task-store.component.scss',
    standalone: false,
})
export class TaskStoreComponent implements OnInit {
    protected tasks: ITask[] = [];

    constructor(
        private readonly taskService: TaskService,
        private toastController: ToastController,
    ) { }

    ngOnInit(): void {
        this.taskService.getAll().subscribe((tasks) => {
            this.tasks = tasks.filter((task) => task.isReward == true);
        });
    }

    async presentToast(message: string): Promise<void> {
        const toast = await this.toastController.create({
            message,
            duration: 2000,
            position: 'bottom',
            color: 'primary',
        });
        await toast.present();
    }

    async buy(task: ITask): Promise<void> {
        await this.taskService.buy(task)
            .subscribe((result) => {
                if (result) {
                    this.presentToast('Task was bought successfully');
                }
            });
    }
}
