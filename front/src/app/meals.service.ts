import { Injectable } from '@angular/core';
import { Config } from '../classes/Config';
import { HttpClient } from '@angular/common/http';
import { Meals } from '../classes/Meals';

@Injectable({
  providedIn: 'root'
})
export class MealsService {

  constructor(private http: HttpClient) { }

  getLastMeals() {
    return this.http.get<Meals[]>(`${Config.getRoot()}/back/get_meals.php`);
  }

  getCalorieLimit() {
    return this.http.get<number>(`${Config.getRoot()}/back/get_calorie_limit.php`);
  }
}
