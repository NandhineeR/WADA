import { Component, Input } from '@angular/core';
import { ParticipantTypeCode, TestParticipant, TOFormControls } from '@shared/models';

@Component({
    selector: 'app-view-participants-table',
    templateUrl: './view-participants-table.component.html',
    styleUrls: ['./view-participants-table.component.scss'],
})
export class ViewParticipantsTableComponent {
    @Input() participants: Array<TestParticipant> = [];

    @Input() whiteList: Map<string, string> = new Map<string, string>();

    LEAD_DCO = ParticipantTypeCode.LEAD_DCO;

    controls = TOFormControls;

    canViewField(fieldName: string): boolean {
        return this.whiteList?.has(fieldName);
    }
}
