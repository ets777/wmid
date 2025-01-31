import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from 'app/core/classes/Config';
import { Observable } from 'rxjs';
import { TaskCategory } from '@backend/task-categories/task-categories.model';

@Injectable({
    providedIn: 'root',
})
export class TaskCategoryService {
    constructor(private http: HttpClient) { }

    getCategories(): Observable<TaskCategory[]> {
        return this.http.get<TaskCategory[]>(`${Config.getApiPath()}/task-categories`);
    }
}
