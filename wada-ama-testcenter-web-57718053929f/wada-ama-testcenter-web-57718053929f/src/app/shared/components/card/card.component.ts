import { Component } from '@angular/core';

@Component({
    selector: 'app-card',
    template: `
        <div class="card">
            <div class="card__header">
                <ng-content select="[card-title]"></ng-content>
            </div>
            <div class="card__content">
                <ng-content select="[card-content]"></ng-content>
            </div>
            <div class="card__bottom">
                <ng-content select="[card-bottom]"></ng-content>
            </div>
        </div>
    `,
    styleUrls: ['./card.component.scss'],
})
export class CardComponent {}
