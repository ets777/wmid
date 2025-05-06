import { Component, OnInit } from '@angular/core';
import { TaskService } from 'app/features/task/services/task.service';
import { ITask } from '@backend/tasks/tasks.interface';

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
    ) { }

    ngOnInit(): void {
        this.taskService.getAll().subscribe((tasks) => {
            this.tasks = tasks.filter((task) => task.isReward == true);
        });
    }
}
