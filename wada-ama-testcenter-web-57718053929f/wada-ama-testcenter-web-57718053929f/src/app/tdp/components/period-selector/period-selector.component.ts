import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-period-selector',
    template: `
        <ng-container [ngSwitch]="period | getPeriodType">
            <span *ngSwitchCase="'yearly'">
                <span *ngIf="!capitalize" i18n="@@yearlyValues_lowercase">yearly values</span>
                <span *ngIf="capitalize" i18n="@@yearlyValues">Yearly values</span>
            </span>
            <span *ngSwitchCase="'quarterly'">
                <span *ngIf="!capitalize" i18n="@@quarterlyValues_lowercase">quarterly values</span>
                <span *ngIf="capitalize" i18n="@@quarterlyValues">Quarterly values</span>
            </span>
            <span *ngSwitchCase="'monthly'">
                <span *ngIf="!capitalize" i18n="@@monthlyValues_lowercase">monthly values</span>
                <span *ngIf="capitalize" i18n="@@monthlyValues">Monthly values</span>
            </span>
            <span *ngSwitchDefault></span>
        </ng-container>
    `,
})
export class PeriodSelectorComponent {
    @Input() period = '';

    @Input() capitalize = false;
}
