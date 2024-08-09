import { isNullOrBlank } from '@shared/utils/string-utils';

export class BloodDonation {
    timeBloodLoss: string;

    cause: string;

    volumeBloodLoss: number | null;

    constructor(bloodDonation?: Partial<BloodDonation> | null) {
        const { timeBloodLoss = '', cause = '', volumeBloodLoss = null } = bloodDonation || {};

        this.timeBloodLoss = timeBloodLoss;
        this.cause = cause;
        this.volumeBloodLoss = volumeBloodLoss;
    }

    isNull(): boolean {
        return (
            isNullOrBlank(this.timeBloodLoss) &&
            isNullOrBlank(this.cause) &&
            isNullOrBlank(this.volumeBloodLoss?.toString())
        );
    }
}
