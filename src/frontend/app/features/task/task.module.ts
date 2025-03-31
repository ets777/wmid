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
import { TaskListPageComponent } from './pages/task-list-page/task-list-page.component';
import { TaskRandomComponent } from './components/task-random/task-random.component';
import { TaskCopyPageComponent } from './pages/task-copy-page/task-copy-page.component';

@NgModule({
    declarations: [
        TaskAddPageComponent,
        TaskEditPageComponent,
        TaskCopyPageComponent,
        TaskListPageComponent,
        TaskListComponent,
        TaskFormComponent,
        TaskRandomComponent,
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
    exports: [
        TaskRandomComponent,
    ],
})
export class TaskModule { }
