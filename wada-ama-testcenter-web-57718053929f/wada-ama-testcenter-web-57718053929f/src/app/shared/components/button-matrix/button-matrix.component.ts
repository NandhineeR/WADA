import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-button-matrix',
    templateUrl: './button-matrix.component.html',
    styleUrls: ['./button-matrix.component.scss'],
})
export class ButtonMatrixComponent {
    @Input() numCols = 3;

    @Input() labels: Array<string> = new Array<string>();

    @Input() selectedIndex = -1;

    @Output()
    readonly itemSelected: EventEmitter<number> = new EventEmitter<number>();

    onSelect(index: number): void {
        this.itemSelected.emit(index);
    }
}
