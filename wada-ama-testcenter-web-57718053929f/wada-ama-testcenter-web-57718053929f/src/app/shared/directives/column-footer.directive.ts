import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
    selector: '[columnFooter]',
})
export class ColumnFooterDirective {
    @Input() columnFooter = '';

    constructor(public template: TemplateRef<any>) {}
}
