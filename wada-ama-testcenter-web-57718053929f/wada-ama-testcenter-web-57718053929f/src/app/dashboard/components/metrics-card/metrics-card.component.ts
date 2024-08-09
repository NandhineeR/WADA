import { Component } from '@angular/core';

@Component({
    selector: 'app-metrics-card',
    template: `
        <div class="card">
            <ng-container>
                <div class="card__header">
                    <div class="card__header-title">
                        <ng-content select="[card-title]"></ng-content>
                    </div>
                    <div class="card__header-spacer"></div>
                </div>
                <div class="card__content">
                    <div class="card__value">
                        <ng-content select="[card-value]"></ng-content>
                    </div>
                    <div class="card__description">
                        <ng-content select="[card-description]"></ng-content>
                    </div>
                    <div class="card__sub-description">
                        <ng-content select="[card-sub-description]"></ng-content>
                    </div>
                </div>
                <div class="card__bottom">
                    <ng-content select="[card-bottom]"></ng-content>
                </div>
            </ng-container>
        </div>
    `,
    styleUrls: ['./metrics-card.component.scss'],
})
export class MetricsCardComponent {}
