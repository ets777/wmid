import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from 'app/features/task/api-services/task-api.service';
import { ITask } from '@backend/tasks/tasks.interface';

@Component({
    selector: 'app-task-edit-page',
    templateUrl: './task-edit-page.component.html',
    styleUrls: ['./task-edit-page.component.sass'],
    standalone: false,
})
export class TaskEditPageComponent implements OnInit {
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
                } else {
                    this.router.navigate(['/']);
                }
            },
        )
    }
}
