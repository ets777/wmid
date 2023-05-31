import { Component, OnInit } from '@angular/core';
import { MealService } from '../meal.service';
import { MealDaily } from '../../classes/MealDaily';

@Component({
  selector: 'app-meals-index-block',
  templateUrl: './meals-index-block.component.html',
  styleUrls: ['./meals-index-block.component.sass']
})
export class MealsIndexBlockComponent implements OnInit {

  meals: MealDaily[] = [];
  limit: number = 0;

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
