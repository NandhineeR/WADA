import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-view-entry',
    templateUrl: './view-entry.component.html',
    styleUrls: ['./view-entry.component.scss'],
})
export class ViewEntryComponent {
    @Input() addTopPadding = false;

    @Input() showEntryLink = true;

    @Input() showEntryValue = true;
}
