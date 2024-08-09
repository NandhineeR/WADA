import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-view-section',
    templateUrl: './view-section.component.html',
    styleUrls: ['./view-section.component.scss'],
})
export class ViewSectionComponent {
    @Input() isLoading = true;
}
