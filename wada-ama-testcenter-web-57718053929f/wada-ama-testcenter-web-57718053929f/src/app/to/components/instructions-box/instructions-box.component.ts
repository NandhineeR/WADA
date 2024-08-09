import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-instructions-box',
    template: `
        <div class="clear-fix">
            <div
                class="box box-width-small field-label"
                [ngClass]="{
                    'first-box-padding': isFirstBox,
                    'remove-padding-top': removePaddingTop,
                    'remove-padding-bottom': removePaddingBottom
                }"
            >
                <ng-content select="[instructions-label]"></ng-content>
            </div>
            <div
                class="box box-width-large"
                [ngClass]="{
                    'first-box-padding': isFirstBox,
                    'remove-padding-top': removePaddingTop,
                    'remove-padding-bottom': removePaddingBottom
                }"
            >
                <ng-content select="[instructions-textarea]" class="instructions"></ng-content>
            </div>
        </div>
    `,
    styleUrls: ['./instructions-box.component.scss'],
})
export class InstructionsBoxComponent {
    @Input() removePaddingTop = false;

    @Input() removePaddingBottom = true;

    @Input() isFirstBox = false;

    @Input() isSameBoxSize = true;
}
