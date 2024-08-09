import { NumberOfErrorsPerCategory } from '@shared/utils/form-util';

export class StepsErrors {
    athleteAndAnalysesSectionErrors: NumberOfErrorsPerCategory;

    authorizationSectionErrors: NumberOfErrorsPerCategory;

    dopingControlPersonelSectionErrors: NumberOfErrorsPerCategory;

    testParticipantsSectionErrors: NumberOfErrorsPerCategory;

    constructor(stepsErrors?: Partial<StepsErrors> | null) {
        const {
            athleteAndAnalysesSectionErrors = {},
            authorizationSectionErrors = {},
            dopingControlPersonelSectionErrors = {},
            testParticipantsSectionErrors = {},
        } = stepsErrors || {};

        this.athleteAndAnalysesSectionErrors = athleteAndAnalysesSectionErrors;
        this.authorizationSectionErrors = authorizationSectionErrors;
        this.dopingControlPersonelSectionErrors = dopingControlPersonelSectionErrors;
        this.testParticipantsSectionErrors = testParticipantsSectionErrors;
    }

    hasMandatoryErrors(): boolean {
        return (
            this.hasAthleteAndAnalysesSectioMandatoryErrors() ||
            this.hasAuthorizationSectionMandatoryErrors() ||
            this.hasDopingControlPersonelSectionMandatoryErrors() ||
            this.hasTestParticipantsSectionMandatoryErrors()
        );
    }

    private hasAthleteAndAnalysesSectioMandatoryErrors(): boolean {
        return (
            Boolean(this.athleteAndAnalysesSectionErrors.Mandatory) ||
            Boolean(this.athleteAndAnalysesSectionErrors.MandatoryDraft)
        );
    }

    private hasAuthorizationSectionMandatoryErrors(): boolean {
        return (
            Boolean(this.authorizationSectionErrors.Mandatory) ||
            Boolean(this.authorizationSectionErrors.MandatoryDraft)
        );
    }

    private hasDopingControlPersonelSectionMandatoryErrors(): boolean {
        return (
            Boolean(this.dopingControlPersonelSectionErrors.Mandatory) ||
            Boolean(this.dopingControlPersonelSectionErrors.MandatoryDraft)
        );
    }

    private hasTestParticipantsSectionMandatoryErrors(): boolean {
        return (
            Boolean(this.testParticipantsSectionErrors.Mandatory) ||
            Boolean(this.testParticipantsSectionErrors.MandatoryDraft)
        );
    }
}
