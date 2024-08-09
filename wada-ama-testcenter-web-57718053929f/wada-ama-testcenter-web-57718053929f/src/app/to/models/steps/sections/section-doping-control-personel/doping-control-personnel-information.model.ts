import { TestParticipant } from '@shared/models/test-participant.model';

export class DopingControlPersonnelInformation {
    instructions: string;

    dcpParticipants: Array<TestParticipant>;

    constructor(dopingControlPersonnel?: Partial<DopingControlPersonnelInformation> | null) {
        const { instructions = '', dcpParticipants = [] } = dopingControlPersonnel || {};
        this.instructions = instructions;
        this.dcpParticipants = (dcpParticipants || []).map((dcpParticipant) => new TestParticipant(dcpParticipant));
    }
}
