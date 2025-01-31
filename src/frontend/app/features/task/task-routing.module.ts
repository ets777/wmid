import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskAddPageComponent } from './pages/task-add-page/task-add-page.component';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { TaskListComponent } from './components/task-list/task-list.component';

const routes: Routes = [
    {
        path: 'add',
        component: TaskAddPageComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'list',
        component: TaskListComponent,
        canActivate: [AuthGuard],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TaskRoutingModule { }
