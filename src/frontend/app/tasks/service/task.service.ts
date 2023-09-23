import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Response } from '../../../classes/Response';
import { Config } from '../../../classes/Config';
import { ITask } from '../interface/task.interface';
import { Observable } from 'rxjs';
import { CreateTaskControllerDto } from '@backend/tasks/dto/create-task-controller.dto';
import { AppointedTaskDto } from '@backend/tasks/dto/apointed-task.dto';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ITask[]> {
    return this.http.get<ITask[]>(`${Config.getApiPath()}/tasks`);
  }

  getCurrent(): Observable<AppointedTaskDto> {
    return this.http.get<AppointedTaskDto>(
      `${Config.getApiPath()}/tasks/getCurrent`,
    );
  }

  add(task: CreateTaskControllerDto): Observable<CreateTaskControllerDto> {
    return this.http.post<CreateTaskControllerDto>(
      `${Config.getApiPath()}/tasks`,
      task,
    );
  }

  complete(appointedTaskDto: AppointedTaskDto): Observable<number> {
    return this.http.post<number>(
      `${Config.getApiPath()}/tasks/complete`,
      appointedTaskDto,
    );
  }

  postpone(appointedTaskDto: AppointedTaskDto): Observable<number> {
    return this.http.post<number>(
      `${Config.getApiPath()}/tasks/postpone`,
      appointedTaskDto,
    );
  }

  appoint(): Observable<AppointedTaskDto> {
    return this.http.post<AppointedTaskDto>(
      `${Config.getApiPath()}/tasks/appoint`,
      {},
    );
  }

  reject(appointedTaskDto: AppointedTaskDto): Observable<number> {
    return this.http.post<number>(
      `${Config.getApiPath()}/tasks/reject`,
      appointedTaskDto,
    );
  }
}
