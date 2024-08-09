import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-confirm-leave',
    templateUrl: './confirm-leave.component.html',
    styleUrls: ['./confirm-leave.component.scss'],
})
export class ConfirmLeaveComponent {
    @Input() hasCustomTitleText = false;

    @Input() hasCustomNoText = false;

    @Input() hasCustomYesText = false;

    @Output()
    readonly confirm: EventEmitter<boolean> = new EventEmitter<boolean>();

    showModal = false;

    onCancel(): void {
        this.confirm.emit(false);
        this.showModal = false;
    }

    onConfirm(): void {
        this.confirm.emit(true);
        this.showModal = false;
    }

    show(): void {
        this.showModal = true;
    }
}
