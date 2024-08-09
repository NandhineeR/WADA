import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[appRadioArrowFocus]',
})
export class RadioArrowFocusDirective {
    constructor(private elementRef: ElementRef) {}

    @HostListener('keydown', ['$event']) onKeyDown(e: KeyboardEvent): void {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            const radios = this.elementRef.nativeElement.querySelectorAll('input');
            const firstRadio = radios[0];
            const lastRadio = radios[radios.length - 1];
            const next = e.key === 'ArrowDown' || e.key === 'ArrowRight';

            if (next && e.target === lastRadio) {
                e.preventDefault();
                firstRadio.focus();
                firstRadio.click();
            } else if (!next && e.target === firstRadio) {
                e.preventDefault();
                lastRadio.focus();
                lastRadio.click();
            }
        }
    }
}
