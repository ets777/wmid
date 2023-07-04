import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Response } from '../../../classes/Response';
import { Config } from '../../../classes/Config';
import { IAdditionalTask } from '../interface/additional-task.interface';
import { ITask } from '../interface/task.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Response> {
    return this.http.get<Response>(`${Config.getRoot()}/back/get_tasks.php`);
  }

  getCurrent(): Observable<Response> {
    return this.http.get<Response>(
      `${Config.getRoot()}/back/get_current_task.php`,
    );
  }

  add(task: ITask): Observable<Response> {
    return this.http.post<Response>(
      `${Config.getRoot()}/back/add_task.php`,
      task,
    );
  }

  complete(
    appointmentId: number,
    additionalTasksCompletion: IAdditionalTask[],
  ): Observable<Response> {
    return this.http.post<Response>(
      `${Config.getRoot()}/back/complete_task.php`,
      {
        mainTaskAppointmentId: appointmentId,
        additionalTasks: additionalTasksCompletion,
      },
    );
  }

  postpone(
    appointmentId: number,
    additionalTasksCompletion: IAdditionalTask[],
  ): Observable<Response> {
    return this.http.post<Response>(
      `${Config.getRoot()}/back/postpone_task.php`,
      {
        mainTaskAppointmentId: appointmentId,
        additionalTasks: additionalTasksCompletion,
      },
    );
  }

  appoint(lastAppointmentId?: number): Observable<Response> {
    return this.http.post<Response>(
      `${Config.getRoot()}/back/appoint_task.php`,
      lastAppointmentId,
    );
  }

  reject(
    appointmentId: number,
    additionalTasksCompletion: IAdditionalTask[],
  ): Observable<Response> {
    return this.http.post<Response>(
      `${Config.getRoot()}/back/reject_task.php`,
      {
        mainTaskAppointmentId: appointmentId,
        additionalTasks: additionalTasksCompletion,
      },
    );
  }
}
