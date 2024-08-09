import { isNullOrBlank } from '@shared/utils/string-utils';

export class AltitudeSimulation {
    deviceType: string;

    useManner: string;

    constructor(altitudeSimulation?: Partial<AltitudeSimulation> | null) {
        const { deviceType = '', useManner = '' } = altitudeSimulation || {};

        this.deviceType = deviceType;
        this.useManner = useManner;
    }

    isNull(): boolean {
        return isNullOrBlank(this.deviceType) && isNullOrBlank(this.useManner);
    }
}
