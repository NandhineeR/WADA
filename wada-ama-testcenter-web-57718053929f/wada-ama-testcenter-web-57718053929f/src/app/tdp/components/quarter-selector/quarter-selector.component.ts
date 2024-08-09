import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-quarter-selector',
    template: `
        <ng-container [ngSwitch]="period | getQuarter">
            <span *ngSwitchCase="'q1'" i18n="@@q1">Q1</span>
            <span *ngSwitchCase="'q2'" i18n="@@q2">Q2</span>
            <span *ngSwitchCase="'q3'" i18n="@@q3">Q3</span>
            <span *ngSwitchCase="'q4'" i18n="@@q4">Q4</span>
            <span *ngSwitchDefault></span>
        </ng-container>
    `,
})
export class QuarterSelectorComponent {
    @Input() period = '';
}
