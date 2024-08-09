import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-view-entry-matching-result',
    templateUrl: './view-entry-matching-result.component.html',
    styleUrls: ['./view-entry-matching-result.component.scss'],
})
export class ViewEntryMatchingResultComponent {
    @Input() header = false;

    @Input() hasError = false;
}
