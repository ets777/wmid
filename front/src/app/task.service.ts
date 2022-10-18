import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '../classes/Task';
import { Response } from '../classes/Response';
import { Config } from '../classes/Config';
import { AdditionalTask } from '../classes/AdditionalTask';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Response>(`${Config.root}/back/get_tasks.php`);
  }

  getCurrent() {
    return this.http.get<Response>(`${Config.root}/back/get_current_task.php`);
  }

  add(task: Task) {
    return this.http.post<Response>(`${Config.root}/back/add_task.php`, task);
  }

  complete(appointmentId: number, additionalTasksCompletion: AdditionalTask[]) {
    return this.http.post<Response>(`${Config.root}/back/complete_task.php`, {
      mainTaskAppointmentId: appointmentId,
      additionalTasks: additionalTasksCompletion,
    });
  }

  postpone(appointmentId: number, additionalTasksCompletion: AdditionalTask[]) {
    return this.http.post<Response>(`${Config.root}/back/postpone_task.php`, {
      mainTaskAppointmentId: appointmentId,
      additionalTasks: additionalTasksCompletion,
    });
  }

  appoint(lastAppointmentId?: number) {
    return this.http.post<Response>(
      `${Config.root}/back/appoint_task.php`,
      lastAppointmentId
    );
  }

  reject(appointmentId: number, additionalTasksCompletion: AdditionalTask[]) {
    return this.http.post<Response>(`${Config.root}/back/reject_task.php`, {
      mainTaskAppointmentId: appointmentId,
      additionalTasks: additionalTasksCompletion,
    });
  }
}
