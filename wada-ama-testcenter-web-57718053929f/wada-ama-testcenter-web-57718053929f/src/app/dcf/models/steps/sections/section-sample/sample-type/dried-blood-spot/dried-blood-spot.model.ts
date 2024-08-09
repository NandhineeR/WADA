import { SampleTypeEnum } from '@shared/models';
import { Sample } from '../sample.model';

export class DriedBloodSpot extends Sample {
    sampleTypeSpecificCode: SampleTypeEnum;

    manufacturerKit: string;

    constructor(driedBloodSpot?: Partial<DriedBloodSpot> | null) {
        super(driedBloodSpot);

        const { manufacturerKit = '' } = driedBloodSpot || {};

        this.sampleTypeSpecificCode = SampleTypeEnum.DriedBloodSpot;
        this.manufacturerKit = manufacturerKit;
    }
}
