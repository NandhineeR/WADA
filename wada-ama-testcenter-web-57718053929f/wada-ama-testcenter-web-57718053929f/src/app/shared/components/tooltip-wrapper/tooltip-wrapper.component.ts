import { Component, ElementRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Placement, PositionHelper, Rect } from '@shared/utils';

export type Size = 'sm' | 'md' | 'lg' | number;

const defaultSizes: { [key: string]: number } = {
    sm: 200,
    md: 350,
    lg: 500,
};

@Component({
    selector: 'app-tooltip-wrapper',
    template: `
        <div
            [@fadeIn]
            #tooltipRef
            appInheritDir
            class="tooltip__content"
            [ngClass]="['tooltip__' + placement]"
            [style.left.px]="left"
            [style.min-width.px]="calculatedSize"
            [style.top.px]="top"
        >
            <div class="tooltip__content-inner">
                <ng-container *ngIf="tooltipTemplate; else textOnly">
                    <ng-container *ngTemplateOutlet="tooltipTemplate; context: tooltipContext"></ng-container>
                </ng-container>
                <ng-template #textOnly>{{ tooltipContent }}</ng-template>
            </div>
        </div>
    `,
    styleUrls: ['./tooltip-wrapper.component.scss'],
    animations: [
        trigger('fadeIn', [transition(':enter', [style({ opacity: 0 }), animate(500, style({ opacity: 1 }))])]),
    ],
})
export class TooltipWrapperComponent {
    @ViewChild('tooltipRef', { static: true }) tooltipRef: ElementRef | undefined;

    @Input() defaultPlacement: Placement = Placement.top;

    @Input() size: Size = 'sm';

    @Input() target: Rect = { left: 0, top: 0, width: 0, height: 0 };

    @Input() tooltipContent: string | undefined;

    @Input() tooltipContext: any = {};

    @Input() tooltipTemplate: TemplateRef<any> | undefined;

    calculatedSize = 0;

    left = 0;

    placement: Placement = this.defaultPlacement;

    top = 0;

    getSize(): number {
        if (this.size in defaultSizes) {
            return defaultSizes[this.size];
        }
        const num = Number(this.size);
        if (Number.isSafeInteger(num) && num > 0) {
            return num;
        }
        return defaultSizes.md;
    }

    placeTooltip(): void {
        if (!this.tooltipRef) {
            return;
        }
        if (this.placement === Placement.top || this.placement === Placement.bottom) {
            this.left = this.target.left + this.target.width / 2;
            this.top = this.target.top + (this.placement === Placement.bottom ? this.target.height : 0);
        } else if (this.placement === Placement.left || this.placement === Placement.right) {
            this.top = this.target.top + this.target.height / 2;
            this.left = this.target.left + (this.placement === Placement.right ? this.target.width : 0);
        }
    }

    update(): void {
        this.calculatedSize = this.getSize();
        this.placement = this.tooltipRef
            ? PositionHelper.getBestPosition(this.tooltipRef, this.target, this.defaultPlacement, 20)
            : this.defaultPlacement;
        this.placeTooltip();
    }
}
