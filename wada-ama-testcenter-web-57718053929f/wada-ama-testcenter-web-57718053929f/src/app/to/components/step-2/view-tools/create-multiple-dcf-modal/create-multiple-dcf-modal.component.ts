import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TestRow } from '@to/models';
import { Country, ListItem } from '@shared/models';

@Component({
    selector: 'app-create-multiple-dcf-modal',
    templateUrl: './create-multiple-dcf-modal.component.html',
    styleUrls: ['./create-multiple-dcf-modal.component.scss'],
})
export class CreateMultipleDCFModalComponent {
    @Output()
    readonly confirm: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Input() testingAuthority: ListItem | null = null;

    @Input() country: Country | null = null;

    @Input() sampleCollectionAuthority: ListItem | null = null;

    @Input() resultManagementAuthority: ListItem | null = null;

    @Input() testType = false;

    @Input() testInWarnings: Array<TestRow> = [];

    @Input() warningForAll = false;

    showModal = false;

    onCancel(): void {
        this.confirm.emit(false);
        this.showModal = false;
    }

    onConfirm(): void {
        this.confirm.emit(true);
        this.showModal = false;
    }

    /**
     * Called from a parent to open the modal
     */
    show(): void {
        this.showModal = true;
    }
}
