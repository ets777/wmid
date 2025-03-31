import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { UserListComponent } from './components/user-list/user-list.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { LayoutsModule } from 'app/layouts/layouts.module';
import { ProfileComponent } from './components/profile/profile.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
    declarations: [
        UserListComponent,
        ProfilePageComponent,
        ProfileComponent,
    ],
    imports: [
        CommonModule,
        UserRoutingModule,
        LayoutsModule,
        IonicModule,
    ],
})
export class UserModule { }
