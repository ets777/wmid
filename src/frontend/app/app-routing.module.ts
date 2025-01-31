import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./core/core.module').then(m => m.CoreModule),
    },
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
    },
    {
        path: 'user',
        loadChildren: () => import('./features/user/user.module').then(m => m.UserModule),
    },
    {
        path: 'task',
        loadChildren: () => import('./features/task/task.module').then(m => m.TaskModule),
    },
    {
        path: 'meal',
        loadChildren: () => import('./features/meal/meal.module').then(m => m.MealModule),
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule { }
