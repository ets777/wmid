import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInPageComponent } from './pages/sign-in-page/sign-in-page.component';
import { SignUpPageComponent } from './pages/sign-up-page/sign-up-page.component';
import { GuestGuard } from 'app/core/guards/guest.guard';

const routes: Routes = [
    {
        path: 'sign-in',
        component: SignInPageComponent,
        canActivate: [GuestGuard],
    },
    {
        path: 'sign-up',
        component: SignUpPageComponent,
        canActivate: [GuestGuard],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AuthRoutingModule { }
