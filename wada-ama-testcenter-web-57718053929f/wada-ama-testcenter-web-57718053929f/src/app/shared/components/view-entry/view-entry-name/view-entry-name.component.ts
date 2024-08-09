import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-view-entry-name',
    templateUrl: './view-entry-name.component.html',
    styleUrls: ['./view-entry-name.component.scss'],
})
export class ViewEntryNameComponent {
    @Input() required = false;

    @Input() invalid = false;

    @Input() hasCheck = false;

    @Input() hasError = false;
}
