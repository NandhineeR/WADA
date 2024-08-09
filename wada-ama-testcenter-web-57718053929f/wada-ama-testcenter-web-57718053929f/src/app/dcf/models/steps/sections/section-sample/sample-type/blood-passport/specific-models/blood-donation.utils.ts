import { BloodDonation } from './blood-donation.model';

export class BloodDonationUtils {
    static requiredFields = {
        Time: 'timeBloodLoss',
        Cause: 'cause',
        Volume: 'volumeBloodLoss',
    };

    static missingFields(bloodDonation: BloodDonation | null = null): Set<string> {
        const missing = new Set<string>(Object.values(this.requiredFields));

        if (bloodDonation) {
            if (bloodDonation.timeBloodLoss) {
                missing.delete(this.requiredFields.Time);
            }
            if (bloodDonation.cause) {
                missing.delete(this.requiredFields.Cause);
            }
            if (bloodDonation.volumeBloodLoss) {
                missing.delete(this.requiredFields.Volume);
            }
        }

        return missing;
    }
}
