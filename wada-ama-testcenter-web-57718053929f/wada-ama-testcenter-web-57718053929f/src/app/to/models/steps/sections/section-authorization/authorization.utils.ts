import { AuthorizationInformation } from '@to/models';

export class AuthorizationUtils {
    static requiredFields = {
        EndDate: 'endDate',
        GrantSCAWriteAccess: 'grantSCAWriteAccess',
        ResultManagementAuthority: 'resultManagementAuthority',
        SampleCollectionAuthority: 'sampleCollectionAuthority',
        StartDate: 'startDate',
        TestingAuthority: 'testingAuthority',
        TestTiming: 'testTiming',
        TestType: 'testType',
    };

    static missingFields(info: AuthorizationInformation | null = null): Set<string> {
        const missing = new Set<string>(Object.values(this.requiredFields));
        this.removeMissingTestFields(info, missing);
        this.removeMissingMajorEventFields(info, missing);
        this.removeMissingDateFields(info, missing);
        this.removeMissingOrganizationFields(info, missing);
        return missing;
    }

    private static removeMissingTestFields(info: AuthorizationInformation | null, missing: Set<string>) {
        if (info) {
            if (info.testType !== null && info.testType !== undefined) {
                missing.delete(this.requiredFields.TestType);
            }
        }
    }

    private static removeMissingMajorEventFields(info: AuthorizationInformation | null, missing: Set<string>) {
        if (info) {
            if (!info.majorEvent) {
                missing.delete(this.requiredFields.TestTiming);
            }
            if (info.majorEvent) {
                if (info.testTiming) {
                    missing.delete(this.requiredFields.TestTiming);
                }
            }
        }
    }

    private static removeMissingDateFields(info: AuthorizationInformation | null, missing: Set<string>) {
        if (info) {
            if (info.startDate) {
                missing.delete(this.requiredFields.StartDate);
            }
            if (info.endDate) {
                missing.delete(this.requiredFields.EndDate);
            }
        }
    }

    private static removeMissingOrganizationFields(info: AuthorizationInformation | null, missing: Set<string>) {
        if (info) {
            if (info.testingAuthority) {
                missing.delete(this.requiredFields.TestingAuthority);
            }
            if (info.sampleCollectionAuthority) {
                missing.delete(this.requiredFields.SampleCollectionAuthority);
            }
            // we just check for errors in GrantSCAWriteAccess in case SCA is different than TA or creator is different than SCA
            if (
                info.sampleCollectionAuthority === info.testingAuthority ||
                info.sampleCollectionAuthority === info.owner ||
                info.grantSCAWriteAccess !== null
            ) {
                missing.delete(this.requiredFields.GrantSCAWriteAccess);
            }
            if (info.resultManagementAuthority) {
                missing.delete(this.requiredFields.ResultManagementAuthority);
            }
        }
    }
}
