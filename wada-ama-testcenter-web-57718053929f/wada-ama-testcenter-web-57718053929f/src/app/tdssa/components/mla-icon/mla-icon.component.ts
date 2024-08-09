import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-mla-icon',
    template: `
        <span
            [style.width.px]="width"
            [style.height.px]="size"
            class="icon"
            [class.green-icon]="type === 'green'"
            [class.red-icon]="type === 'red'"
            [class.yellow-icon]="type === 'yellow'"
            [class.bar-icon]="type === 'bar'"
        >
        </span>
    `,
    styleUrls: ['./mla-icon.component.scss'],
})
export class MLAIconComponent {
    @Input() type: 'green' | 'red' | 'yellow' | 'bar' = 'green';

    @Input() size = 20;

    get width(): number {
        return this.type === 'bar' ? 4 : this.size;
    }
}
