import { Component, OnInit } from '@angular/core';
import { TaskService } from 'app/features/task/api-services/task-api.service';
import { ITask } from '@backend/tasks/tasks.interface';

@Component({
    selector: 'app-task-list',
    templateUrl: './task-list.component.html',
    styleUrl: './task-list.component.scss',
    standalone: false,
})
export class TaskListComponent implements OnInit {
    protected tasks: ITask[] = [];

    constructor(
        private readonly taskService: TaskService,
    ) { }

    ngOnInit(): void {
        this.taskService.getAll().subscribe((tasks) => {
            this.tasks = tasks;
        });
    }

    protected deleteTask(taskId: number): void {
        this.taskService.delete(taskId).subscribe((response) => {
            if (response > 0) {
                this.tasks = this.tasks.filter((task) => task.id !== taskId)
            }
        })
    }
}
