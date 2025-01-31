import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from 'app/core/classes/Config';
import { Observable } from 'rxjs';
import { CreateTaskDto } from '@backend/tasks/dto/create-task.dto';
import { Task } from '@backend/tasks/tasks.model';

@Injectable({
    providedIn: 'root',
})
export class TaskService {
    constructor(private http: HttpClient) { }

    getAll(): Observable<Task[]> {
        return this.http.get<Task[]>(`${Config.getApiPath()}/tasks`);
    }

    getCurrent(): Observable<Task> {
        return this.http.get<Task>(
            `${Config.getApiPath()}/tasks/getCurrent`,
        );
    }

    add(task: CreateTaskDto): Observable<CreateTaskDto> {
        
        return this.http.post<CreateTaskDto>(
            `${Config.getApiPath()}/tasks`,
            task,
        );
    }

    complete(task: Task): Observable<number> {
        return this.http.post<number>(
            `${Config.getApiPath()}/tasks/complete/${task.id}`,
            {},
        );
    }

    postpone(task: Task): Observable<number> {
        return this.http.post<number>(
            `${Config.getApiPath()}/tasks/postpone`,
            task,
        );
    }

    appoint(): Observable<Task> {
        return this.http.post<Task>(
            `${Config.getApiPath()}/tasks/appoint`,
            {},
        );
    }

    reject(task: Task): Observable<number> {
        return this.http.post<number>(
            `${Config.getApiPath()}/tasks/reject`,
            task,
        );
    }
}
