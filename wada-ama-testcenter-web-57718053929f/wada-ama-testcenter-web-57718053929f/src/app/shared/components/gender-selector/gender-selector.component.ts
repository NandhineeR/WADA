import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-gender-selector',
    template: `
        <ng-container [ngSwitch]="gender">
            <span *ngSwitchCase="'M'" i18n="@@male">Male</span>
            <span *ngSwitchCase="'F'" i18n="@@female">Female</span>
            <span *ngSwitchDefault i18n="@@unknown">Unknown</span>
        </ng-container>
    `,
})
export class GenderSelectorComponent {
    @Input() gender = '';
}
