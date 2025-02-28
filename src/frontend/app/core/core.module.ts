import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexPageComponent } from './pages/index-page/index-page.component';
import { IonicModule } from '@ionic/angular';
import { CoreRoutingModule } from './core-routing.module';
import { TaskModule } from 'app/features/task/task.module';
import { LayoutsModule } from 'app/layouts/layouts.module';

@NgModule({
    declarations: [
        IndexPageComponent,
    ],
    imports: [
        CommonModule,
        IonicModule,
        CoreRoutingModule,
        TaskModule,
        LayoutsModule,
    ],
})
export class CoreModule { }
