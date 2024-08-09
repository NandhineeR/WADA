import { BloodTransfusion } from './blood-transfusion.model';

export class BloodTransfusionUtils {
    static requiredFields = {
        Time: 'timeBloodTransfusion',
        Volume: 'volumeBloodTransfusion',
    };

    static missingFields(bloodTransfusion: BloodTransfusion | null = null): Set<string> {
        const missing = new Set<string>(Object.values(this.requiredFields));

        if (bloodTransfusion) {
            if (bloodTransfusion.timeBloodTransfusion) {
                missing.delete(this.requiredFields.Time);
            }
            if (bloodTransfusion.volumeBloodTransfusion) {
                missing.delete(this.requiredFields.Volume);
            }
        }

        return missing;
    }
}
