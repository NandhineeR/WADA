import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

interface LetContext<T> {
    appLet?: T;
}

@Directive({
    selector: '[appLet]',
})
export class LetDirective<T> {
    private context: LetContext<T> = { appLet: undefined };

    constructor(private viewContainer: ViewContainerRef, private templateRef: TemplateRef<LetContext<T>>) {
        viewContainer.createEmbeddedView(templateRef, this.context);
    }

    @Input()
    set appLet(value: T) {
        this.context.appLet = value;
    }
}
