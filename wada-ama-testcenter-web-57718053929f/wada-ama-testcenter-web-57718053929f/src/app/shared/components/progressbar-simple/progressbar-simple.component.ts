import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-progressbar-simple',
    templateUrl: './progressbar-simple.component.html',
    styleUrls: ['./progressbar-simple.component.scss'],
})
export class ProgressbarSimpleComponent {
    @Input() set value(value: number) {
        this.valueRounded = Math.round(value * 100);
    }

    valueRounded = 0;
}
