import { TestParticipant } from '@shared/models/test-participant.model';

export class TestParticipantsInformation {
    testParticipants: Array<TestParticipant>;

    constructor(dopingControlPersonnel?: Partial<TestParticipantsInformation> | null) {
        const { testParticipants = [] } = dopingControlPersonnel || {};
        this.testParticipants = (testParticipants || []).map((testParticipant) => new TestParticipant(testParticipant));
    }
}
