import { AuthorizationInformation } from './authorization-information.model';

export class AuthorizationUtils {
    static requiredFields = {
        TestingAuthority: 'testingAuthority',
        SampleCollectionAuthority: 'sampleCollectionAuthority',
        ResultManagementAuthority: 'resultManagementAuthority',
    };

    static missingFields(info: AuthorizationInformation | null = null): Set<string> {
        const missing = new Set<string>(Object.values(this.requiredFields));

        if (info) {
            if (info.testingAuthority) {
                missing.delete(this.requiredFields.TestingAuthority);
            }
            if (info.sampleCollectionAuthority) {
                missing.delete(this.requiredFields.SampleCollectionAuthority);
            }
            if (info.resultManagementAuthority) {
                missing.delete(this.requiredFields.ResultManagementAuthority);
            }
        }

        return missing;
    }
}
