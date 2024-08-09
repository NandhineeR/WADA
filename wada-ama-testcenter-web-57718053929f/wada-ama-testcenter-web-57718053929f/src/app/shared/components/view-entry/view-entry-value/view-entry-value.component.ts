import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-view-entry-value',
    templateUrl: './view-entry-value.component.html',
    styleUrls: ['./view-entry-value.component.scss'],
})
export class ViewEntryValueComponent {
    // The input field data-qa attribute
    @Input() dataQA?: string;
}
