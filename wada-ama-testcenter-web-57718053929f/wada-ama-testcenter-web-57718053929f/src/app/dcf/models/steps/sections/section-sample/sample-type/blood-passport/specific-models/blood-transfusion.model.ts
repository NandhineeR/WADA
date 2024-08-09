import { isNullOrBlank } from '@shared/utils/string-utils';

export class BloodTransfusion {
    timeBloodTransfusion: string;

    volumeBloodTransfusion: number | null;

    constructor(bloodTransfusion?: Partial<BloodTransfusion> | null) {
        const { timeBloodTransfusion = '', volumeBloodTransfusion = null } = bloodTransfusion || {};

        this.timeBloodTransfusion = timeBloodTransfusion;
        this.volumeBloodTransfusion = volumeBloodTransfusion;
    }

    isNull(): boolean {
        return isNullOrBlank(this.timeBloodTransfusion) && isNullOrBlank(this.volumeBloodTransfusion?.toString());
    }
}
