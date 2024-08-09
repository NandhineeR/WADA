import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
    selector: 'app-modal-button',
    template: `
        <app-button
            #modalButton
            [dataQA]="dataQA"
            [disabled]="disabled"
            [id]="id"
            [ngClass]="{ 'margin-left': setMargin }"
            [type]="type"
        >
            <ng-content></ng-content>
        </app-button>
    `,
    styleUrls: ['./modal-button.component.scss'],
})
export class ModalButtonComponent {
    @ViewChild('modalButton') modalButtonRef?: ElementRef;

    @Input() dataQA?: string;

    @Input() disabled = false;

    @Input() id?: string;

    @Input() setMargin = false;

    @Input() type: 'primary' | 'secondary' | 'delete' = 'primary';
}
