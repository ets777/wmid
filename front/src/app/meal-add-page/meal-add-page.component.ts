import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { MealType } from '../../classes/MealType';
import { Product } from '../../classes/Product';
import { MealService } from '../meal.service';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { Meal } from 'src/classes/Meal';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD.MM.YYYY',
    monthYearA11yLabel: 'DD.MM.YYYY',
  },
};

@Component({
  selector: 'app-meal-add-page',
  templateUrl: './meal-add-page.component.html',
  styleUrls: ['./meal-add-page.component.sass'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_LOCALE, useValue: 'ru-RU' },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class MealAddPageComponent implements OnInit {

  mealTypes: MealType[] = [];
  products: Product[] = [];
  addMealForm: FormGroup = this.formBuilder.group({});

  constructor(
    private formBuilder: FormBuilder,
    private mealService: MealService
  ) {
    this.addMealForm = this.formBuilder.group({
      date: '',
      mealTypeId: 0,
      products: this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    this.mealService
      .getMealTypes()
      .subscribe(a => (this.mealTypes = a));

    this.mealService
      .getProducts()
      .subscribe(a => (this.products = a));

    this.addProduct();
  }

  addProduct() {
    this.getProducts().push(
      this.formBuilder.group({
        id: undefined,
        name: undefined,
        calories: undefined,
        weight: undefined,
        new: false
      })
    );
  }

  removeProduct(i: number) {
    this.getProducts().removeAt(i);
  }

  getProducts(): FormArray {
    return this.addMealForm.get('products') as FormArray;
  }

  getNewCheckboxValue(i: number) {
    return this.getProducts().controls[i].get('new')?.value;
  }

  onSubmit() {
    let meal = new Meal();

    meal.date = this.addMealForm.value.date.format('YYYY-MM-DD');
    meal.mealTypeId = this.addMealForm.value.mealTypeId;
    meal.products = this.getProducts().controls.map(a => {
      let product = new Product();
      let isNew = a.get('new')?.value;

      if (isNew) {
        product.calories = a.get('calories')?.value;
        product.name = a.get('name')?.value;
      } else {
        product.id = a.get('id')?.value;
      }
      product.weight = a.get('weight')?.value;

      return product;

    });

    this
      .mealService
      .add(meal)
      .subscribe(a => {
        console.log(a);
      })
  }

}
