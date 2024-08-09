import { AltitudeSimulation } from './altitude-simulation.model';

export class AltitudeSimulationUtils {
    static requiredFields = {
        DeviceType: 'deviceType',
        UseManner: 'useManner',
    };

    static missingFields(altitudeSimulation: AltitudeSimulation | null = null): Set<string> {
        const missing = new Set<string>(Object.values(this.requiredFields));

        if (altitudeSimulation) {
            if (altitudeSimulation.deviceType) {
                missing.delete(this.requiredFields.DeviceType);
            }
            if (altitudeSimulation.useManner) {
                missing.delete(this.requiredFields.UseManner);
            }
        }

        return missing;
    }
}
