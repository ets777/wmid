import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { PageComponent } from './components/page/page.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
    declarations: [TopBarComponent, PageComponent],
    imports: [
        CommonModule,
        RouterModule,
        IonicModule,
    ],
    exports: [PageComponent],
})
export class LayoutsModule { }
