import { isNullOrBlank } from '@shared/utils/string-utils';
import { Participant, SampleTypeEnum } from '@shared/models';
import { Sample } from '../sample.model';

export class Urine extends Sample {
    sampleTypeSpecificCode: SampleTypeEnum;

    volume: number | null;

    volumeBelowMinimumReason: string;

    partialVolume: number | null;

    specificGravity: string | null;

    witnessChaperone: Participant | null;

    valid: boolean;

    reasonValid: string | null;

    constructor(urine?: Partial<Urine> | null) {
        super(urine);

        const {
            partialVolume = null,
            volume = null,
            volumeBelowMinimumReason = '',
            specificGravity = '',
            witnessChaperone = null,
            valid = true,
            reasonValid = null,
        } = urine || {};

        this.partialVolume = this.partial ? partialVolume : null;
        this.sampleTypeSpecificCode = SampleTypeEnum.Urine;
        this.volume = this.partial ? null : volume;
        this.volumeBelowMinimumReason = volumeBelowMinimumReason;
        this.specificGravity = specificGravity;
        this.witnessChaperone = witnessChaperone ? new Participant(witnessChaperone) : null;
        this.valid = valid;
        this.reasonValid = reasonValid;
    }

    get displayWitnessChaperoneDescriptionName(): string {
        const firstName = this.witnessChaperone?.firstName || '';
        const lastName = this.witnessChaperone?.lastName || '';
        return `${lastName}${!isNullOrBlank(lastName) ? ', ' : ''}${firstName}`;
    }
}
