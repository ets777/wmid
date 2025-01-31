import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-confirm-modal',
    templateUrl: './confirm-modal.component.html',
    styleUrls: ['./confirm-modal.component.scss'],
    standalone: false,
})
export class ConfirmModalComponent {
    @Input() text = 'Are you sure you want to proceed?';
    @Input() header = 'Confirmation';
    @Input() confirmText = 'Confirm';
    @Input() cancelText = 'Cancel';
    
    constructor(private modalController: ModalController) {}

    dismiss(result: boolean): void {
        this.modalController.dismiss(result);
    }
}
