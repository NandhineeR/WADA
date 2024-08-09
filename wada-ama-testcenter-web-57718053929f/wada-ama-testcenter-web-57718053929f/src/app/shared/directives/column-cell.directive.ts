import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
    selector: '[columnCell]',
})
export class ColumnCellDirective {
    @Input() columnCell = '';

    constructor(public template: TemplateRef<any>) {}
}
