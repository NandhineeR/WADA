import { Sample } from './sample.model';

export class SampleUtils {
    static requiredFields = {
        SampleType: 'sampleTypeSpecificCode',
        SampleCode: 'sampleCode',
        CollectionDate: 'collectionDate',
        Timezone: 'timezone',
        Manufacturer: 'manufacturer',
        Laboratory: 'laboratory',
    };

    static missingFields(sample: Sample | null = null): Set<string> {
        const missing = new Set<string>(Object.values(this.requiredFields));

        if (sample) {
            if (sample.sampleTypeSpecificCode) {
                missing.delete(this.requiredFields.SampleType);
            }

            if (sample.sampleCode) {
                missing.delete(this.requiredFields.SampleCode);
            }

            if (sample.collectionDate) {
                missing.delete(this.requiredFields.CollectionDate);
            } else {
                missing.delete(this.requiredFields.Timezone);
            }

            if (sample.timezone) {
                missing.delete(this.requiredFields.Timezone);
            }

            if (sample.laboratory) {
                missing.delete(this.requiredFields.Laboratory);
            }

            if (sample.manufacturer) {
                missing.delete(this.requiredFields.Manufacturer);
            }
        }

        return missing;
    }
}
