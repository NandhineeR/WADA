import { isValidBoolean } from '@shared/utils/boolean-utils';
import { isValidNumber } from '@shared/utils/number-utils';
import { isNullOrBlank } from '@shared/utils/string-utils';
import { SampleUtils } from '../sample.utils';
import { Urine } from './urine.model';

export class UrineUtils {
    static requiredUrineFields = {
        Partial: 'partial',
        Volume: 'volume',
        PartialVolume: 'partialVolume',
        SpecificGravity: 'specificGravity',
        WitnessChaperone: 'witnessChaperone',
    };

    static requiredFields = {
        ...SampleUtils.requiredFields,
        ...UrineUtils.requiredUrineFields,
    };

    static missingFields(urine: Urine | null = null, multipleDcf = false): Set<string> {
        const missing = new Set<string>(Object.values(this.requiredUrineFields));
        SampleUtils.missingFields(urine).forEach((field: string) => missing.add(field));
        this.removeMissingLabFields(urine, missing, multipleDcf);
        this.removeMissingPersonFields(urine, missing);
        this.removeMissingSampleFields(urine, missing);
        return missing;
    }

    private static removeMissingLabFields(urine: Urine | null, missing: Set<string>, multipleDcf: boolean) {
        if (urine) {
            if (multipleDcf) {
                missing.delete(this.requiredFields.Laboratory);
                missing.delete(this.requiredFields.Partial);
            }
            if (urine.laboratory || urine.partial) {
                missing.delete(this.requiredFields.Laboratory);
            }
        }
    }

    private static removeMissingPersonFields(urine: Urine | null, missing: Set<string>) {
        if (urine) {
            if (urine.witnessChaperone && urine.witnessChaperone.firstName && urine.witnessChaperone.lastName) {
                missing.delete(this.requiredFields.WitnessChaperone);
            }
        }
    }

    private static removeMissingSampleFields(urine: Urine | null, missing: Set<string>) {
        if (urine) {
            if (isValidBoolean(urine.partial)) {
                missing.delete(this.requiredFields.Partial);
            }
            if (isValidNumber(urine.volume) || urine.partial) {
                missing.delete(this.requiredFields.Volume);
            }
            if (isValidNumber(urine.partialVolume) || !urine.partial) {
                missing.delete(this.requiredFields.PartialVolume);
            }
            if (!isNullOrBlank(urine.specificGravity) || urine.partial) {
                missing.delete(this.requiredFields.SpecificGravity);
            }
        }
    }
}
