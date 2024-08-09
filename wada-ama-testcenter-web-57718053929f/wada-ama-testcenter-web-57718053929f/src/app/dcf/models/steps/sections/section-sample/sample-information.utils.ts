import { isValidBoolean } from '@shared/utils/boolean-utils';
import { SampleInformation } from './sample-information.model';

export class SampleInformationUtils {
    static requiredFields = {
        ArrivalDate: 'arrivalDate',
        Timezone: 'timezone',
        TestType: 'testType',
        MajorEvent: 'majorEvent',
        CompetitionName: 'competitionName',
        FeeForService: 'feeForService',
    };

    static missingFields(info: SampleInformation | null = null): Set<string> {
        const missing = new Set<string>(Object.values(this.requiredFields));

        if (info) {
            if (info.arrivalDate) {
                missing.delete(this.requiredFields.ArrivalDate);
            } else {
                missing.delete(this.requiredFields.Timezone);
            }

            if (info.timezone) {
                missing.delete(this.requiredFields.Timezone);
            }

            if (isValidBoolean(info.testType)) {
                missing.delete(this.requiredFields.TestType);
                missing.delete(this.requiredFields.MajorEvent);
                missing.delete(this.requiredFields.CompetitionName);
            }

            if (isValidBoolean(info.feeForService)) {
                missing.delete(this.requiredFields.FeeForService);
            }
        }

        return missing;
    }
}
