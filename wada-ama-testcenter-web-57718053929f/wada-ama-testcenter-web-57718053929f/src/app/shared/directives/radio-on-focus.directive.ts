import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[appRadioOnFocus]',
})
export class RadioOnFocusDirective {
    constructor(private elementRef: ElementRef) {}

    @HostListener('focus') focus(): void {
        if (
            this.elementRef.nativeElement &&
            !this.elementRef.nativeElement.checked &&
            this.elementRef.nativeElement.parentNode?.parentNode?.querySelector(':checked')
        ) {
            this.elementRef.nativeElement.parentNode.parentNode.querySelector(':checked').focus();
        }
    }

    @HostListener('click') click(): void {
        this.elementRef.nativeElement.focus();
    }
}
