import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './components/user-list/user-list.component';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';

const routes: Routes = [
    {
        path: 'list',
        component: UserListComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'profile',
        component: ProfilePageComponent,
        canActivate: [AuthGuard],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class UserRoutingModule { }
