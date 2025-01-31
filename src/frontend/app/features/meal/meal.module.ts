import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MealRoutingModule } from './meal-routing.module';
import { RouterModule } from '@angular/router';
import { MealsIndexBlockComponent } from './components/meals-index-block/meals-index-block.component';
import { MealAddPageComponent } from './components/meal-add-page/meal-add-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';


@NgModule({
    declarations: [
        MealsIndexBlockComponent, 
        MealAddPageComponent,
    ],
    imports: [
        CommonModule,
        MealRoutingModule,
        RouterModule,
        ReactiveFormsModule,
        IonicModule,
    ],
})
export class MealModule { }
