import { Component, OnInit } from '@angular/core';
import { MealService } from 'app/features/meal/services/meal.service';
import { MealDaily } from 'app/features/meal/classes/MealDaily';

@Component({
    selector: 'app-meals-index-block',
    templateUrl: './meals-index-block.component.html',
    styleUrls: ['./meals-index-block.component.sass'],
    standalone: false,
})
export class MealsIndexBlockComponent implements OnInit {

    meals: MealDaily[] = [];
    limit = 0;

    constructor(
        private mealService: MealService
    ) { }

    ngOnInit(): void {
        this.mealService.getLastMeals().subscribe((a) => (this.meals = a));

        this
            .mealService
            .getCalorieLimit()
            .subscribe(a => this.limit = a)
    }

}
