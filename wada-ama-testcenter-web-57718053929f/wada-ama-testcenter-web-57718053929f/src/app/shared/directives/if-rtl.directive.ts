import { AfterContentInit, Directive, TemplateRef, ViewContainerRef } from '@angular/core';
import { DirectionalityService } from '@core/services';

@Directive({
    selector: '[appIfRTL]',
})
export class IfRTLDirective implements AfterContentInit {
    constructor(
        private directionality: DirectionalityService,
        private viewContainer: ViewContainerRef,
        private templateRef: TemplateRef<any>
    ) {}

    ngAfterContentInit(): void {
        if (this.directionality.value === 'rtl') {
            this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
            this.viewContainer.clear();
        }
    }
}
