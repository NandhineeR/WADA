export class StepsSubmitted {
    athleteAndAnalysesSectionSubmitted: boolean;

    authorizationSectionSubmitted: boolean;

    dopingControlPersonelSectionSubmitted: boolean;

    testParticipantsSectionSubmitted: boolean;

    constructor(stepsSubmitted?: Partial<StepsSubmitted> | null) {
        const {
            athleteAndAnalysesSectionSubmitted = false,
            authorizationSectionSubmitted = false,
            dopingControlPersonelSectionSubmitted = false,
            testParticipantsSectionSubmitted = false,
        } = stepsSubmitted || {};

        this.athleteAndAnalysesSectionSubmitted = athleteAndAnalysesSectionSubmitted;
        this.authorizationSectionSubmitted = authorizationSectionSubmitted;
        this.dopingControlPersonelSectionSubmitted = dopingControlPersonelSectionSubmitted;
        this.testParticipantsSectionSubmitted = testParticipantsSectionSubmitted;
    }
}
