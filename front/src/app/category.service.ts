import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category } from '../classes/Category';
import { Config } from '../classes/Config';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(
    private http: HttpClient
  ) { }

  getCategories() {
    return this.http.get<Category[]>(`${Config.root}/back/get_categories.php`);
  }
}
