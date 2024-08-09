import { isNullOrBlank } from '@shared/utils/string-utils';
import { Participant, SampleTypeEnum } from '@shared/models';
import { Sample } from '../sample.model';

export class Blood extends Sample {
    sampleTypeSpecificCode: SampleTypeEnum;

    bloodCollectionOfficial: Participant | null;

    valid: boolean;

    constructor(blood?: Partial<Blood> | null) {
        super(blood);

        const { bloodCollectionOfficial = null, valid = true } = blood || {};
        this.sampleTypeSpecificCode = SampleTypeEnum.Blood;
        this.bloodCollectionOfficial = bloodCollectionOfficial ? new Participant(bloodCollectionOfficial) : null;
        this.valid = valid;
    }

    get displayBloodCollectionOfficialDescriptionName(): string {
        const firstName = this.bloodCollectionOfficial?.firstName || '';
        const lastName = this.bloodCollectionOfficial?.lastName || '';
        return `${lastName}${!isNullOrBlank(lastName) ? ', ' : ''}${firstName}`;
    }
}
