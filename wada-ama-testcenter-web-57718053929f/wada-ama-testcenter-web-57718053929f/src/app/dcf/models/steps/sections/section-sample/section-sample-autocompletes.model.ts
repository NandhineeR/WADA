import { Laboratory, LocalizedEntity, Participant, SampleType } from '@shared/models';

export class SectionSampleAutoCompletes {
    bloodOfficials: Array<Participant>;

    laboratories: Array<Laboratory>;

    manufacturers: Array<LocalizedEntity>;

    sampleTypes: Array<SampleType>;

    witnessChaperones: Array<Participant>;

    constructor(step4AutoCompletes?: Partial<SectionSampleAutoCompletes> | null) {
        const { bloodOfficials = [], laboratories = [], manufacturers = [], sampleTypes = [], witnessChaperones = [] } =
            step4AutoCompletes || {};

        this.bloodOfficials = bloodOfficials.map((bloodOfficial) => new Participant(bloodOfficial));
        this.laboratories = laboratories.map((lab) => new Laboratory(lab));
        this.manufacturers = manufacturers.map((manufacturer) => new LocalizedEntity(manufacturer));
        this.sampleTypes = sampleTypes.map((sampleType) => new SampleType(sampleType));
        this.witnessChaperones = witnessChaperones.map((witnessChaperone) => new Participant(witnessChaperone));
    }
}
