import { Directive, HostListener, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { formatTime, timeFormatRegex } from '@shared/utils/time-format-utils';

@Directive({
    selector: '[appTimeFormat]',
})
export class TimeFormatDirective {
    @Input() appTimeFormat: AbstractControl | null = null;

    @Input() setTimeForString = false;

    @HostListener('blur', ['$event']) onblur(event: any): void {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        const newValue = timeFormatRegex.test(target.value) ? formatTime(target.value) : target.value;
        if (this.setTimeForString) {
            target.value = newValue;
        }
        if (newValue !== target.value && this.appTimeFormat) {
            target.value = newValue;
            this.appTimeFormat.patchValue(newValue);
        }
    }
}
