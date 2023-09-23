import { Component, OnInit } from '@angular/core';
import { TaskService } from '../tasks/service/task.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppointedTaskDto } from '@backend/tasks/dto/apointed-task.dto';

@Component({
  selector: 'app-index-page',
  templateUrl: './index-page.component.html',
  styleUrls: ['./index-page.component.sass'],
})
export class IndexPageComponent implements OnInit {
  appointedTask: AppointedTaskDto;
  loading = false;

  constructor(
    private taskService: TaskService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.getCurrent();
  }

  complete(): void {
    if (this.appointedTask.appointmentId) {
      this.taskService.complete(this.appointedTask).subscribe((result) => {
        if (result) {
          this.appointedTask = null;
        } else {
          this.openSnackBar('Ошибка при выполнении задания');
        }
      });
    }
  }

  completeAndAppoint(): void {
    if (this.appointedTask.appointmentId) {
      this.taskService.complete(this.appointedTask).subscribe((result) => {
        if (result) {
          this.appoint();
        } else {
          this.openSnackBar('Ошибка при выполнении задания');
        }
      });
    }
  }

  postpone(): void {
    if (this.appointedTask.appointmentId) {
      this.taskService.postpone(this.appointedTask).subscribe((result) => {
        if (result) {
          this.appoint();
        } else {
          this.openSnackBar('Ошибка при откладывании задания');
        }
      });
    }
  }

  appoint(): void {
    this.loading = true;

    this.taskService.appoint().subscribe((appointedTask) => {
      this.loading = false;

      if (appointedTask?.text) {
        this.openSnackBar('Задание успешно назначено');
        this.appointedTask = appointedTask;
      } else {
        this.openSnackBar('Заданий нет');
        this.appointedTask = null;
      }
    });
  }

  reject(): void {
    if (this.appointedTask.appointmentId) {
      this.taskService.reject(this.appointedTask).subscribe((a) => {
        if (a > 0) {
          this.appoint();
        } else {
          this.openSnackBar('Ошибка при отмене задания');
        }
      });
    }
  }

  getCurrent(): void {
    this.taskService.getCurrent().subscribe((task) => {
      if (task) {
        this.appointedTask = task;
      } else if (task !== null) {
        this.openSnackBar('Ошибка при получении задания');
      }
    });
  }

  checkAdditionalTask(a: any, appointmentId: any): void {
    const i = this.appointedTask.additionalTasks.findIndex(
      (a) => a.appointmentId == appointmentId,
    );
    this.appointedTask.additionalTasks[i].isCompleted = a.checked;
  }

  openSnackBar(message: string): void {
    this.snackBar.open(message, undefined, {
      duration: 2500,
      panelClass: 'snackbar',
    });
  }
}
