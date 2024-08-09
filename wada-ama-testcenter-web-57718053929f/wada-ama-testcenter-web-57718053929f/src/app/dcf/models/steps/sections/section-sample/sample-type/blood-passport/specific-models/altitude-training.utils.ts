import { isValidNumber } from '@shared/utils/number-utils';
import { AltitudeTraining } from './altitude-training.model';

export class AltitudeTrainingUtils {
    static requiredFields = {
        Location: 'location',
        Altitude: 'altitude',
        Start: 'start',
        End: 'end',
    };

    static missingFields(altitudeTraining: AltitudeTraining | null = null): Set<string> {
        const missing = new Set<string>(Object.values(this.requiredFields));

        if (altitudeTraining) {
            if (altitudeTraining.location) {
                missing.delete(this.requiredFields.Location);
            }
            if (isValidNumber(altitudeTraining.altitude)) {
                missing.delete(this.requiredFields.Altitude);
            }
            if (altitudeTraining.start) {
                missing.delete(this.requiredFields.Start);
            }
            if (altitudeTraining.end) {
                missing.delete(this.requiredFields.End);
            }
        }

        return missing;
    }
}
