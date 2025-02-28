import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { IndexPageComponent } from './pages/index-page/index-page.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Route[] = [
    {
        path: '',
        component: IndexPageComponent,
        canActivate: [AuthGuard],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CoreRoutingModule { }
