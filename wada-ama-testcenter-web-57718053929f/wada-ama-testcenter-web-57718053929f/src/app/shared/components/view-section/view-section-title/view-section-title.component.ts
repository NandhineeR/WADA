import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ConfirmLeaveComponent } from '@shared/components';
import { ViewSectionArrowDirection, ViewSectionTitleTheme } from './view-section-title.customs';

@Component({
    selector: 'app-view-section-title',
    templateUrl: './view-section-title.component.html',
    styleUrls: ['./view-section-title.component.scss'],
})
export class ViewSectionTitleComponent {
    @ViewChild('deleteAthleteConfirmModal') deleteAthleteConfirmModal: ConfirmLeaveComponent | undefined;

    @Output() readonly delete = new EventEmitter();

    @Input() arrowDirection: ViewSectionArrowDirection = 'up';

    @Input() businessErrors = 0;

    @Input() canWrite = true;

    @Input() dataQA?: string;

    @Input() formatErrors = 0;

    @Input() hasBeenSaved = false;

    @Input() inCreation = false;

    @Input() inEdit = false;

    @Input() inView = false;

    @Input() isActive = true;

    @Input() isDelete = true;

    @Input() isInModal = false;

    @Input() queryParams: any;

    @Input() link: Array<any> | string = '#';

    @Input() numberErrors = 0;

    @Input() rightControls = false;

    @Input() rightInfo?: string;

    @Input() rightInfoIcon?: boolean;

    @Input() sectionNumber = 0;

    @Input() sectionTitle = '';

    @Input() singleForm = true;

    @Input() theme: ViewSectionTitleTheme = 'default';

    deleteElement(event: any): void {
        this.deleteAthleteConfirmModal?.show();
        event.stopPropagation();
    }
}
