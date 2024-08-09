import { Component, ComponentRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { TooltipService } from '@core/services';
import { HostContainerDirective } from '@shared/directives';
import { TooltipWrapperComponent } from '@shared/components';

@Component({
    selector: 'app-tooltip-container',
    template: `<ng-template appHostContainer></ng-template>`,
})
export class TooltipContainerComponent implements OnDestroy {
    @ViewChild(HostContainerDirective, { static: true }) host: HostContainerDirective | undefined;

    tooltipSubscription: Subscription = this.tooltipService.tooltip$.subscribe(
        (tooltip: ComponentRef<TooltipWrapperComponent> | undefined) => {
            if (this.host) {
                this.host.viewContainerRef.clear();
                if (tooltip) {
                    this.host.viewContainerRef.insert(tooltip.hostView);
                    tooltip.changeDetectorRef.detectChanges();
                    tooltip.instance.update();
                }
            }
        }
    );

    constructor(private tooltipService: TooltipService) {}

    ngOnDestroy(): void {
        this.tooltipSubscription.unsubscribe();
    }

    @HostListener('window:scroll') onscroll(): void {
        this.tooltipService.hide();
    }
}
