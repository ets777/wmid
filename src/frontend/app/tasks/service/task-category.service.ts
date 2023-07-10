import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ICategory } from '../interface/category.interface';
import { Config } from '../../../classes/Config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaskCategoryService {
  constructor(private http: HttpClient) {}

  getCategories(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(`${Config.getApiPath()}/task-categories`);
  }
}
