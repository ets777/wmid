import { Component, OnInit } from '@angular/core';
import { TaskService } from 'app/features/task/services/task.service';
import { Task } from '@backend/tasks/tasks.model';

@Component({
    selector: 'app-task-list',
    templateUrl: './task-list.component.html',
    styleUrl: './task-list.component.sass',
    standalone: false,
})
export class TaskListComponent implements OnInit {
    tasks: Task[] = [];

    constructor(
        private readonly taskService: TaskService,
    ) { }

    ngOnInit(): void {
        this.taskService.getAll().subscribe((tasks) => {
            this.tasks = tasks;
        });
    }
}
