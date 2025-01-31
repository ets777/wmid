import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GoalRoutingModule } from './goal-routing.module';
import { IonicModule } from '@ionic/angular';
import { GoalsIndexBlockComponent } from './components/goals-index-block/goals-index-block.component';


@NgModule({
    declarations: [GoalsIndexBlockComponent],
    imports: [
        CommonModule,
        GoalRoutingModule,
        IonicModule,
    ],
})
export class GoalModule { }
