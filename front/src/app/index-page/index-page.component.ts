import { Component, OnInit } from '@angular/core';
import { TaskService } from '../task.service';
import { Task } from '../../classes/Task';
import { AdditionalTask } from '../../classes/AdditionalTask';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-index-page',
  templateUrl: './index-page.component.html',
  styleUrls: ['./index-page.component.sass'],
})
export class IndexPageComponent implements OnInit {
  emptyTask: Task = {
    text: '',
    appointmentId: 0,
    statusId: 0,
    additionalTasks: [],
  };
  currentTask: Task = this.emptyTask;

  additionalTasksCompletion: AdditionalTask[] = [];

  constructor(
    private taskService: TaskService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getCurrent();
  }

  complete() {
    if (this.currentTask.appointmentId && this.additionalTasksCompletion) {
      this.taskService
        .complete(
          this.currentTask.appointmentId,
          this.additionalTasksCompletion
        )
        .subscribe(a => {
          if (a?.success) {
            this.appoint();
          } else {
            this.openSnackBar('Ошибка при выполнении задания');
          }
        });
    }
  }

  postpone() {
    if (this.currentTask.appointmentId && this.additionalTasksCompletion) {
      this.taskService
        .postpone(
          this.currentTask.appointmentId,
          this.additionalTasksCompletion
        )
        .subscribe(a => {
          if (a?.success) {
            this.appoint();
          } else {
            this.openSnackBar('Ошибка при откладывании задания');
          }
        });
    }
  }

  appoint() {
    this.taskService.appoint(this.currentTask.appointmentId).subscribe(a => {
      if (a?.success) {
        this.openSnackBar('Задание успешно назначено');
        this.getCurrent();
      } else {
        this.openSnackBar('Заданий нет');
        this.currentTask = this.emptyTask;
      }
    });
  }

  reject() {
    if (this.currentTask.appointmentId && this.additionalTasksCompletion) {
      this.taskService
        .reject(this.currentTask.appointmentId, this.additionalTasksCompletion)
        .subscribe(a => {
          if (a?.success) {
            this.appoint();
          } else {
            this.openSnackBar('Ошибка при отмене задания');
          }
        });
    }
  }

  getCurrent() {
    this.taskService.getCurrent().subscribe(a => {
      if (a && a.success) {
        const tasks = a.data;

        if (Array.isArray(tasks) && tasks.length) {
          const mainTask: Task = tasks.find((a: Task) => a.statusId == 1);
          const additionalTasks = tasks.filter((a: Task) => a.statusId == 7);

          mainTask.additionalTasks = additionalTasks;

          this.additionalTasksCompletion = additionalTasks.map(a => {
            return {
              appointmentId: +a.appointmentId,
              completed: false,
            };
          });

          this.currentTask = mainTask;
        } else {
          this.currentTask = {
            text: '',
            appointmentId: 0,
          };
        }
      } else {
        this.openSnackBar('Ошибка при получении задания');
      }
    });
  }

  checkAdditionalTask(a: any, appointmentId: any) {
    const i = this.additionalTasksCompletion.findIndex(
      a => a.appointmentId == appointmentId
    );
    this.additionalTasksCompletion[i].completed = a.checked;
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, undefined, {
      duration: 2500,
      panelClass: 'snackbar',
    });
  }
}
