import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskAddPageComponent } from './pages/task-add-page/task-add-page.component';
import { TaskEditPageComponent } from './pages/task-edit-page/task-edit-page.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { TaskRoutingModule } from './task-routing.module';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { LayoutsModule } from 'app/layouts/layouts.module';
import { SharedModule } from 'app/shared/shared.module';
import { MaskitoDirective } from '@maskito/angular';

@NgModule({
    declarations: [
        TaskAddPageComponent,
        TaskEditPageComponent,
        TaskListComponent,
        TaskFormComponent,
    ],
    imports: [
        CommonModule,
        TaskRoutingModule,
        IonicModule,
        ReactiveFormsModule,
        LayoutsModule,
        SharedModule,
        MaskitoDirective,
    ],
})
export class TaskModule { }
