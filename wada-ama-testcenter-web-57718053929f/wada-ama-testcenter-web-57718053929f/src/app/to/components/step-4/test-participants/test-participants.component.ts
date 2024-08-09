import { Component, Input } from '@angular/core';
import { TestParticipant, TOFormControls } from '@shared/models';
import { AuthorizationUtils } from '@to/models';

@Component({
    selector: 'app-test-participants',
    templateUrl: './test-participants.component.html',
    styleUrls: ['./test-participants.component.scss'],
})
export class TestParticipantsViewComponent {
    readonly controls = TOFormControls;

    readonly fields = AuthorizationUtils.requiredFields;

    @Input() canWrite = false;

    @Input() testingOrderId = null;

    @Input() whiteList: Map<string, string> = new Map<string, string>();

    @Input() set testParticipants(testParticipants: TestParticipant[] | null) {
        this._testParticipants = testParticipants;
    }

    get testParticipants(): TestParticipant[] | null {
        return this._testParticipants;
    }

    missingFields = new Set<string>();

    private _testParticipants: TestParticipant[] | null = null;
}
