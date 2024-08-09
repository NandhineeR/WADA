import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[appRestrictToPattern]',
})
export class RestrictToPatternDirective {
    @Input() appRestrictToPattern = '^[0-9]*$';

    constructor(private elementRef: ElementRef) {}

    @HostListener('keydown', ['$event']) onKeyDown(e: KeyboardEvent): void {
        // Allow [backspace, tab, enter, escape, insert, delete, f5, home, end, left, right, up, down]
        const allowedSpecialKeys = [
            'Backspace',
            'Tab',
            'Enter',
            'Escape',
            'Insert',
            'Delete',
            'F5',
            'Home',
            'End',
            'ArrowLeft',
            'ArrowUp',
            'ArrowRight',
            'ArrowDown',
        ];

        if (
            allowedSpecialKeys.indexOf(e.key) !== -1 ||
            ['Backspace', '9', '13', '27', '45', '46', '116'].indexOf(e.key) !== -1 ||
            // Allow Ctrl+... and Alt+... but not Ctrl+Alt
            ((e.ctrlKey || e.altKey) && !(e.ctrlKey && e.altKey)) ||
            // Allow characters that match the regex
            new RegExp(this.appRestrictToPattern).test(e.key) ||
            new RegExp(this.appRestrictToPattern).test(this.elementRef.nativeElement.value + e.key)
        ) {
            // let it happen, don't do anything
        } else {
            e.preventDefault();
        }
    }
}
