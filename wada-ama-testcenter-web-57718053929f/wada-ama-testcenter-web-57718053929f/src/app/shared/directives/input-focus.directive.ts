import { AfterContentInit, Directive, ElementRef, Input } from '@angular/core';
/**
 * Directive is used to set focus on elements in the DOM
 */
@Directive({
    selector: '[appAutofocus]',
})
export class InputFocusDirective implements AfterContentInit {
    @Input() appAutoFocus?: boolean;

    constructor(private elementRef: ElementRef) {}

    ngAfterContentInit(): void {
        setTimeout(() => this.elementRef.nativeElement.focus());
    }
}
