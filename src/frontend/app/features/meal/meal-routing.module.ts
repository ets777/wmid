import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MealAddPageComponent } from './components/meal-add-page/meal-add-page.component';
import { AuthGuard } from 'app/core/guards/auth.guard';

const routes: Routes = [
    {
        path: 'add',
        component: MealAddPageComponent,
        canActivate: [AuthGuard],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class MealRoutingModule { }
