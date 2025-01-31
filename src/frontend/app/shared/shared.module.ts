import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ConfirmModalComponent } from './modals/confirm-modal/confirm-modal.component';
import { TimePickerModalComponent } from './modals/time-picker-modal/time-picker-modal.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        ConfirmModalComponent,
        TimePickerModalComponent,
    ],
    imports: [
        CommonModule,
        IonicModule,
        ReactiveFormsModule,
    ],
})
export class SharedModule { }
