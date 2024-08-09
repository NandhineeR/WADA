import { Participant } from '@shared/models';

export class ListParticipantAutoCompletes {
    athleteId: string | null;

    participants: Array<Participant>;

    scaId: string | null;

    constructor(listParticipantAutoCompletes?: Partial<ListParticipantAutoCompletes> | null) {
        const { athleteId = null, scaId = null, participants = null } = listParticipantAutoCompletes || {};
        this.athleteId = athleteId;
        this.scaId = scaId;
        this.participants = (participants || []).map((p: any) => new Participant(p));
    }
}
