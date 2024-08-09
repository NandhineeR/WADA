import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-view-entry-yes-no',
    templateUrl: './view-entry-yes-no.component.html',
})
export class ViewEntryYesNoComponent {
    @Input() yes: any = null;
}
