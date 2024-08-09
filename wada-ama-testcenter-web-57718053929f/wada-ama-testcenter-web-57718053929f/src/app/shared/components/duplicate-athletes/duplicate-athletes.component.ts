import { Component, EventEmitter, Output } from '@angular/core';
import { ModalStatus } from '@to/models';

@Component({
    selector: 'app-duplicate-athlete-leave',
    templateUrl: './duplicate-athletes.component.html',
    styleUrls: ['./duplicate-athletes.component.scss'],
})
export class DuplicateAthletesComponent {
    @Output()
    readonly confirm: EventEmitter<ModalStatus> = new EventEmitter<ModalStatus>();

    showModal = false;

    onCancel(): void {
        this.confirm.emit(ModalStatus.cancel);
        this.showModal = false;
    }

    onExit(): void {
        this.confirm.emit(ModalStatus.exit);
        this.showModal = false;
    }

    onConfirm(): void {
        this.confirm.emit(ModalStatus.add);
        this.showModal = false;
    }

    show(): void {
        this.showModal = true;
    }
}
