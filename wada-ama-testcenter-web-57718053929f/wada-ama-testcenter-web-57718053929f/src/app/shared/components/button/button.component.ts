import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'app-button',
    template: `
        <button
            #buttonRef
            class="button"
            type="button"
            [attr.data-qa]="dataQA"
            [attr.data-qa-precision]="dataQAPrecision"
            [attr.id]="id"
            [class.button__delete]="type === 'delete'"
            [class.button__primary]="type === 'primary'"
            [class.button__secondary]="type === 'secondary'"
            [disabled]="disabled"
        >
            <ng-content></ng-content>
        </button>
    `,
    styleUrls: ['./button.component.scss'],
})
export class ButtonComponent implements OnInit {
    @ViewChild('buttonRef', { static: true }) buttonRef?: ElementRef;

    @Input() dataQA?: string;

    @Input() dataQAPrecision?: string;

    @Input() disabled = false;

    @Input() focus = false;

    @Input() id?: string;

    @Input() type: 'primary' | 'secondary' | 'delete' = 'primary';

    ngOnInit(): void {
        if (this.focus) {
            setTimeout(() => this.buttonRef && this.buttonRef.nativeElement.focus());
        }
    }
}
