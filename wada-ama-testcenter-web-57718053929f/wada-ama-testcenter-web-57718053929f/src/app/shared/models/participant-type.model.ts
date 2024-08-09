import { ParticipantTypeCode } from './enums/participant-type-code.enum';

export class ParticipantType {
    code: ParticipantTypeCode | null;

    description: string;

    constructor(participantType?: Partial<ParticipantType> | null) {
        const { code = null, description = '' } = participantType || {};

        this.code = code;
        this.description = description;
    }
}
