import { Component, OnInit } from '@angular/core';
import { MealsService } from '../meals.service';
import { Meals } from 'src/classes/Meals';

@Component({
  selector: 'app-meals-index-block',
  templateUrl: './meals-index-block.component.html',
  styleUrls: ['./meals-index-block.component.sass']
})
export class MealsIndexBlockComponent implements OnInit {

  meals: Meals[] = [];
  limit: number = 0;

  constructor(
    private mealsService: MealsService
  ) { }

  ngOnInit(): void {
    this
      .mealsService
      .getLastMeals()
      .subscribe(a => this.meals = a);

    this
      .mealsService
      .getCalorieLimit()
      .subscribe(a => this.limit = a)
  }

}
