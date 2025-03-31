import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from 'app/features/task/services/task.service';
import { ITask } from '@backend/tasks/tasks.interface';

@Component({
    selector: 'app-task-copy-page',
    templateUrl: './task-copy-page.component.html',
    styleUrls: ['./task-copy-page.component.sass'],
    standalone: false,
})
export class TaskCopyPageComponent implements OnInit {
    protected task: ITask;

    constructor(
        private route: ActivatedRoute,
        private taskService: TaskService,
        private router: Router,
    ) { }

    ngOnInit(): void {
        const taskId = +this.route.snapshot.paramMap.get('id');

        this.taskService.getById(taskId).subscribe(
            (task) => {
                if (task) {
                    this.task = task;
                    delete this.task.id;
                } else {
                    this.router.navigate(['/']);
                }
            },
        )
    }
}
