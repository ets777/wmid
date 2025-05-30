import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskAddPageComponent } from './pages/task-add-page/task-add-page.component';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { TaskListPageComponent } from './pages/task-list-page/task-list-page.component';
import { TaskEditPageComponent } from './pages/task-edit-page/task-edit-page.component';
import { TaskCopyPageComponent } from './pages/task-copy-page/task-copy-page.component';
import { TaskStorePageComponent } from './pages/task-store-page/task-store-page.component';

const routes: Routes = [
    {
        path: 'add',
        component: TaskAddPageComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'edit/:id',
        component: TaskEditPageComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'copy/:id',
        component: TaskCopyPageComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'list',
        component: TaskListPageComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'store',
        component: TaskStorePageComponent,
        canActivate: [AuthGuard],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TaskRoutingModule { }
