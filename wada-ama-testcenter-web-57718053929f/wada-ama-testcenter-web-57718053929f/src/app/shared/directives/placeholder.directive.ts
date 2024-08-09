import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[appPlaceholder]',
})
export class PlaceholderDirective {
    @Input() placeholder = '1.0';

    constructor(private elementRef: ElementRef) {}

    @HostListener('focus') onFocus(): void {
        if (this.elementRef.nativeElement.value === '') {
            this.elementRef.nativeElement.value = this.placeholder;
        } else {
            const size = this.elementRef.nativeElement.value.length;
            this.elementRef.nativeElement.setSelectionRange(size, size);
        }
    }

    @HostListener('blur') onBlur(): void {
        if (this.elementRef.nativeElement.value === this.placeholder) {
            this.elementRef.nativeElement.value = '';
        }
    }
}
