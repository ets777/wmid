import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexPageComponent } from './components/index-page/index-page.component';
import { IonicModule } from '@ionic/angular';
import { CoreRoutingModule } from './core-routing.module';

@NgModule({
    declarations: [
        IndexPageComponent,
    ],
    imports: [
        CommonModule,
        IonicModule,
        CoreRoutingModule,
    ],
})
export class CoreModule { }
