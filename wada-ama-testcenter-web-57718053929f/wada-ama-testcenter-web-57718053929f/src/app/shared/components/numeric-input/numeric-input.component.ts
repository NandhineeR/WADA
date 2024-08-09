import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-numeric-input',
    template: `
        <div class="wrapper" appInheritDir>
            <span class="chevron chevron-left" (click)="decrement()"></span>
            <span class="value">{{ value }}</span>
            <span class="chevron chevron-right" (click)="increment()"></span>
        </div>
    `,
    styleUrls: ['./numeric-input.component.scss'],
})
export class NumericInputComponent {
    @Input() value = 0;

    @Output()
    readonly valueChanged: EventEmitter<number> = new EventEmitter<number>();

    decrement(): void {
        this.valueChanged.emit(this.value - 1);
    }

    increment(): void {
        this.valueChanged.emit(this.value + 1);
    }
}
