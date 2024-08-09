import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Direction, DirectionalityService } from '@core/services';

@Directive({
    selector: '[appIfDir]',
})
export class IfDirDirective {
    private direction: Direction = 'ltr';

    constructor(
        private directionality: DirectionalityService,
        private viewContainer: ViewContainerRef,
        private templateRef: TemplateRef<any>
    ) {}

    @Input()
    set appIfDir(direction: Direction) {
        this.direction = direction;
        this.updateView();
    }

    private updateView(): void {
        if (this.directionality.value === this.direction) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
            this.viewContainer.clear();
        }
    }
}
