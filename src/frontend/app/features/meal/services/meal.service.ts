import { Injectable } from '@angular/core';
import { Config } from 'app/core/classes/Config';
import { HttpClient } from '@angular/common/http';
import { Product } from 'app/features/meal/classes/Product';
import { MealDaily } from 'app/features/meal/classes/MealDaily';
import { MealType } from 'app/features/meal/classes/MealType';
import { Meal } from 'app/features/meal/classes/Meal';

@Injectable({
    providedIn: 'root',
})
export class MealService {
    constructor(private http: HttpClient) { }

    getLastMeals() {
        return this.http.get<MealDaily[]>(`${Config.getRoot()}/back/get_meals.php`);
    }

    getCalorieLimit() {
        return this.http.get<number>(`${Config.getRoot()}/back/get_calorie_limit.php`);
    }

    getMealTypes() {
        return this.http.get<MealType[]>(`${Config.getRoot()}/back/get_meal_types.php`);
    }

    getProducts() {
        return this.http.get<Product[]>(`${Config.getRoot()}/back/get_products.php`);
    }

    add(meal: Meal) {
        return this.http.post<Response>(`${Config.getRoot()}/back/add_meal.php`, meal);
    }
}
