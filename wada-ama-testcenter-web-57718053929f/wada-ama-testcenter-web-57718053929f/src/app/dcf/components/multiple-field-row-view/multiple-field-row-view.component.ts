import { Component, Input } from '@angular/core';
import { isNullOrBlank } from '@shared/utils';

@Component({
    selector: 'app-multiple-field-row-view',
    templateUrl: './multiple-field-row-view.component.html',
    styleUrls: ['./multiple-field-row-view.component.scss'],
})
export class MultipleFieldRowViewComponent {
    @Input() dataQA = '';

    @Input() id = '';

    @Input() items = [];

    @Input() mainItem = '';

    getSelectedField(index: number): string {
        return `app-view-entry-name[role=field-${index}]`;
    }

    isMainItemNullOrBlank(): boolean {
        return isNullOrBlank(this.mainItem);
    }
}
