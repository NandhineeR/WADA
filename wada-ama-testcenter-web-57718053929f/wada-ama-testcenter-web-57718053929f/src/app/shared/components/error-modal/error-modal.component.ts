import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-error-modal',
    templateUrl: './error-modal.component.html',
    styleUrls: ['./error-modal.component.scss'],
})
export class ErrorModalComponent {
    @Output()
    readonly confirm: EventEmitter<boolean> = new EventEmitter<boolean>();

    showModal = false;

    show(): void {
        this.showModal = true;
    }

    onCancel(): void {
        this.confirm.emit(false);
        this.showModal = false;
    }
}
