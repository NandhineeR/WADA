import { Blood } from '.';
import { SampleUtils } from '../sample.utils';

export class BloodUtils {
    static requiredBloodFields = {
        BloodCollectionOfficial: 'bloodCollectionOfficial',
    };

    static requiredFields = {
        ...SampleUtils.requiredFields,
        ...BloodUtils.requiredBloodFields,
    };

    static missingFields(blood: Blood | null = null, multipleDcf = false): Set<string> {
        const missing = new Set<string>(Object.values(this.requiredBloodFields));

        SampleUtils.missingFields(blood).forEach((field: string) => missing.add(field));

        if (blood) {
            if (multipleDcf) {
                missing.delete(this.requiredFields.Laboratory);
            }
            if (
                blood.bloodCollectionOfficial &&
                blood.bloodCollectionOfficial.firstName &&
                blood.bloodCollectionOfficial.lastName
            )
                missing.delete(this.requiredFields.BloodCollectionOfficial);
        }

        return missing;
    }
}
