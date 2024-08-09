import { Participant, ParticipantType, Status } from '@shared/models';

export class SectionTestParticipantsAutoCompletes {
    bloodOfficials: Array<Participant>;

    moParticipants: Array<Participant>;

    notifyingChaperones: Array<Participant>;

    participantStatuses: Array<Status>;

    participantTypes: Array<ParticipantType>;

    witnessChaperones: Array<Participant>;

    constructor(step3AutoCompletes?: Partial<SectionTestParticipantsAutoCompletes> | null) {
        const {
            bloodOfficials = [],
            moParticipants = [],
            notifyingChaperones = [],
            participantStatuses = [],
            participantTypes = [],
            witnessChaperones = [],
        } = step3AutoCompletes || {};

        this.bloodOfficials = bloodOfficials.map((bco) => new Participant(bco));
        this.moParticipants = moParticipants.map((moParticipant) => new Participant(moParticipant));
        this.notifyingChaperones = notifyingChaperones.map((notifyingChaperone) => new Participant(notifyingChaperone));
        this.participantStatuses = participantStatuses.map((participantStatus) => new Status(participantStatus));
        this.participantTypes = participantTypes.map((participantType) => new ParticipantType(participantType));
        this.witnessChaperones = witnessChaperones.map((witnessChaperone) => new Participant(witnessChaperone));
    }
}
