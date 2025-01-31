import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-time-picker-modal',
    templateUrl: './time-picker-modal.component.html',
    styleUrls: ['./time-picker-modal.component.scss'],
    standalone: false,
})
export class TimePickerModalComponent {
    @Input() control: FormControl;
    @Input() text = '';
    @Input() header = 'Choose the time';
    @Input() confirmText = 'Confirm';
    @Input() cancelText = 'Cancel';
    
    constructor(private modalController: ModalController) {}

    dismiss(result: boolean): void {
        this.modalController.dismiss(result);
    }
}
