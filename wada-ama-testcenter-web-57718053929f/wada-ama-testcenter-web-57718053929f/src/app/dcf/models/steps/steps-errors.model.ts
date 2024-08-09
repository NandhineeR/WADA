import { NumberOfErrorsPerCategory } from '@shared/utils';

export class StepsErrors {
    athleteSectionErrors: NumberOfErrorsPerCategory;

    authorizationSectionErrors: NumberOfErrorsPerCategory;

    notificationSectionErrors: NumberOfErrorsPerCategory;

    proceduralSectionErrors: NumberOfErrorsPerCategory;

    sampleSectionErrors: NumberOfErrorsPerCategory;

    constructor(stepsErrors?: Partial<StepsErrors> | null) {
        const {
            athleteSectionErrors = {},
            authorizationSectionErrors = {},
            notificationSectionErrors = {},
            proceduralSectionErrors = {},
            sampleSectionErrors = {},
        } = stepsErrors || {};

        this.athleteSectionErrors = athleteSectionErrors;
        this.authorizationSectionErrors = authorizationSectionErrors;
        this.notificationSectionErrors = notificationSectionErrors;
        this.proceduralSectionErrors = proceduralSectionErrors;
        this.sampleSectionErrors = sampleSectionErrors;
    }

    hasMandatoryErrors(): boolean {
        return (
            this.hasAthleteSectioMandatoryErrors() ||
            this.hasAuthorizationSectionMandatoryErrors() ||
            this.hasNotificationSectionMandatoryErrors() ||
            this.hasProceduralSectionMandatoryErrors() ||
            this.hasSampleSectionMandatoryErrors()
        );
    }

    private hasAthleteSectioMandatoryErrors(): boolean {
        return Boolean(this.athleteSectionErrors.Mandatory) || Boolean(this.athleteSectionErrors.MandatoryDraft);
    }

    private hasAuthorizationSectionMandatoryErrors(): boolean {
        return (
            Boolean(this.authorizationSectionErrors.Mandatory) ||
            Boolean(this.authorizationSectionErrors.MandatoryDraft)
        );
    }

    private hasNotificationSectionMandatoryErrors(): boolean {
        return (
            Boolean(this.notificationSectionErrors.Mandatory) || Boolean(this.notificationSectionErrors.MandatoryDraft)
        );
    }

    private hasProceduralSectionMandatoryErrors(): boolean {
        return Boolean(this.proceduralSectionErrors.Mandatory) || Boolean(this.proceduralSectionErrors.MandatoryDraft);
    }

    private hasSampleSectionMandatoryErrors(): boolean {
        return Boolean(this.sampleSectionErrors.Mandatory) || Boolean(this.sampleSectionErrors.MandatoryDraft);
    }
}
