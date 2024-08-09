import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[appNoZero]',
})
export class NoZeroDirective {
    constructor(private elementRef: ElementRef) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @HostListener('keyup', ['$event']) onInput(_event: any): void {
        this.clearElementValue();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @HostListener('change', ['$event']) onChange(_event: any): void {
        this.clearElementValue();
    }

    private clearElementValue() {
        if (this.elementRef.nativeElement.value === '0') {
            this.elementRef.nativeElement.value = '';
        }
    }
}
