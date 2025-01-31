import { NgModule } from '@angular/core';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: 'sign-in',
        component: SignInComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AuthRoutingModule { }
