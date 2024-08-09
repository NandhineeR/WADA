import { Participant, ParticipantType, Status } from '@shared/models';

export class SectionDopingControlPersonelAutoCompletes {
    dcos: Array<Participant>;

    participantStatuses: Array<Status>;

    participantTypes: Array<ParticipantType>;

    constructor(step3AutoCompletes?: Partial<SectionDopingControlPersonelAutoCompletes> | null) {
        const { dcos = [], participantStatuses = [], participantTypes = [] } = step3AutoCompletes || {};

        this.dcos = dcos.map((participant) => new Participant(participant));
        this.participantStatuses = participantStatuses.map((participantStatus) => new Status(participantStatus));
        this.participantTypes = participantTypes.map((participantType) => new ParticipantType(participantType));
    }
}
