import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { MealType } from 'app/features/meal/classes/MealType';
import { Product } from 'app/features/meal/classes/Product';
import { MealService } from 'app/features/meal/services/meal.service';
import { Meal } from 'app/features/meal/classes/Meal';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

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
    standalone: false,
})
export class MealAddPageComponent implements OnInit {
    mealTypes: MealType[] = [];
    products: Product[] = [];
    addMealForm: FormGroup;
    filteredProducts: Observable<Product[]>[] = [];
    myControl = new FormControl('');

    constructor(
        private formBuilder: FormBuilder,
        private mealService: MealService,
    ) {
        this.addMealForm = this.formBuilder.group({
            date: '',
            mealTypeId: 0,
            products: this.formBuilder.array([]),
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
                new: false,
            })
        );

        const i = this.getProducts().length - 1;

        this.filteredProducts.push((this.getProduct(i).get('id') as FormControl).valueChanges.pipe(
            startWith(''),
            map(value => {
                const name = typeof value === 'string' ? value : value?.name;
                return name ? this._filter(name as string) : this.products.slice();
            }),
        ));

    }

    removeProduct(i: number) {
        this.getProducts().removeAt(i);
        this.filteredProducts.splice(i, 1);
    }

    getProducts(): FormArray {
        return this.addMealForm.get('products') as FormArray;
    }

    getNewCheckboxValue(i: number) {
        return this.getProduct(i).get('new')?.value;
    }

    getProduct(i: number) {
        return this.getProducts().controls[i];
    }

    onSubmit() {
        const meal = new Meal();

        meal.date = this.addMealForm.value.date.format('YYYY-MM-DD');
        meal.mealTypeId = this.addMealForm.value.mealTypeId;
        meal.products = this.getProducts().controls.map(a => {

            const product = new Product();
            const isNew = a.get('new')?.value;

            if (isNew) {
                product.calories = a.get('calories')?.value;
                product.name = a.get('name')?.value;
            } else {
                product.id = a.get('id')?.value.id;
            }
            product.weight = a.get('weight')?.value;

            return product;

        });

        this.mealService.add(meal).subscribe((a) => {
            console.log(a);
        });
    }

    displayFn(product: Product): string {
        return product && product.name ? product.name : '';
    }

    private _filter(value: string): Product[] {
        const filterValue = value.toLowerCase();

        return this.products.filter((option) =>
            option.name?.toLowerCase().includes(filterValue),
        );
    }
}
