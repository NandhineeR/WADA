import { ProceduralInformation } from './procedural-information.model';

export class ProceduralInformationUtils {
    static requiredFields = {
        Dco: 'dco',
        ConsentForResearch: 'consentForResearch',
    };

    static missingFields(info: ProceduralInformation | null = null): Set<string> {
        const missing = new Set<string>(Object.values(this.requiredFields));

        if (info) {
            if (info.dco && info.dco.firstName && info.dco.lastName) {
                missing.delete(this.requiredFields.Dco);
            }
            if (info.consentForResearch !== undefined && info.consentForResearch !== null) {
                missing.delete(this.requiredFields.ConsentForResearch);
            }
        }

        return missing;
    }
}
