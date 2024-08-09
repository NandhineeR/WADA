import { isNullOrBlank } from '@shared/utils/string-utils';
import { SampleUtils } from '../sample.utils';
import { DriedBloodSpot } from './dried-blood-spot.model';

export class DriedBloodSpotUtils {
    static requiredDriedBloodSpotFields = {
        ManufacturerKit: 'manufacturerKit',
    };

    static requiredFields = {
        ...SampleUtils.requiredFields,
        ...DriedBloodSpotUtils.requiredDriedBloodSpotFields,
    };

    static missingFields(driedBloodSpot: DriedBloodSpot | null = null, multipleDcf = false): Set<string> {
        const missing = new Set<string>(Object.values(this.requiredDriedBloodSpotFields));

        // Manufacturer kit is removed because it's not required by default
        missing.delete(this.requiredDriedBloodSpotFields.ManufacturerKit);

        SampleUtils.missingFields(driedBloodSpot).forEach((field: string) => missing.add(field));

        if (driedBloodSpot) {
            if (multipleDcf) {
                missing.delete(this.requiredFields.Laboratory);
            }
            // Manufacturer kit becomes mandatory only when Manufacturer is filled in.
            if (driedBloodSpot.manufacturer && isNullOrBlank(driedBloodSpot.manufacturerKit)) {
                missing.add(this.requiredFields.ManufacturerKit);
            }
        }

        return missing;
    }
}
