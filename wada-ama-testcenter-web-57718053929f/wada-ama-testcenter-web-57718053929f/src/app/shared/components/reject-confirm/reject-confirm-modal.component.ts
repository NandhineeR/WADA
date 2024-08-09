import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-reject-confirm-modal',
    templateUrl: './reject-confirm-modal.component.html',
    styleUrls: ['./reject-confirm-modal.component.scss'],
})
export class RejectConfirmModalComponent {
    @Output() readonly confirmMatchEmitter: EventEmitter<void> = new EventEmitter<void>();

    @Output() readonly rejectMatchEmitter: EventEmitter<void> = new EventEmitter<void>();

    @Input() isRejectMatch = false;

    showModal = false;

    onCancel(): void {
        this.showModal = false;
    }

    onConfirm(): void {
        this.confirmMatchEmitter.emit();
        this.showModal = false;
    }

    onReject(): void {
        this.rejectMatchEmitter.emit();
        this.showModal = false;
    }

    show(): void {
        this.showModal = true;
    }
}
