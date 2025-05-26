import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from 'app/core/classes/Config';
import { Observable } from 'rxjs';
import { CreateTaskDto } from '@backend/tasks/dto/create-task.dto';
import { ITask } from '@backend/tasks/tasks.interface';
import { UpdateTaskDto } from '@backend/tasks/dto/update-task.dto';

@Injectable({
    providedIn: 'root',
})
export class TaskService {
    constructor(private http: HttpClient) { }

    public getAll(): Observable<ITask[]> {
        return this.http.get<ITask[]>(`${Config.getApiPath()}/tasks`);
    }

    public getById(id: number): Observable<ITask> {
        return this.http.get<ITask>(`${Config.getApiPath()}/tasks/${id}`);
    }

    public getCurrent(): Observable<ITask> {
        return this.http.get<ITask>(
            `${Config.getApiPath()}/tasks/getCurrent`,
        );
    }

    public add(task: CreateTaskDto): Observable<ITask> {
        return this.http.post<ITask>(
            `${Config.getApiPath()}/tasks`,
            task,
        );
    }

    public update(task: UpdateTaskDto): Observable<number> {
        return this.http.patch<number>(
            `${Config.getApiPath()}/tasks/${task.id}`,
            task,
        );
    }

    public delete(taskId: number): Observable<number> {
        return this.http.delete<number>(
            `${Config.getApiPath()}/tasks/${taskId}`,
        );
    }

    public complete(task: ITask): Observable<number> {
        return this.http.post<number>(
            `${Config.getApiPath()}/tasks/complete/${task.id}`,
            {},
        );
    }

    public postpone(task: ITask, minutes: number): Observable<number> {
        return this.http.post<number>(
            `${Config.getApiPath()}/tasks/postpone/${task.id}`,
            { postponeTimeMinutes: minutes },
        );
    }

    public buy(task: ITask): Observable<number> {
        return this.http.post<number>(
            `${Config.getApiPath()}/tasks/buy/${task.id}`,
            {},
        );
    }

    public appoint(): Observable<ITask> {
        return this.http.post<ITask>(
            `${Config.getApiPath()}/tasks/appoint`,
            {},
        );
    }

    public reject(task: ITask): Observable<number> {
        return this.http.post<number>(
            `${Config.getApiPath()}/tasks/reject/${task.id}`,
            {},
        );
    }
}
