export class StepsSubmitted {
    athleteSectionSubmitted: boolean;

    authorizationSectionSubmitted: boolean;

    notificationSectionSubmitted: boolean;

    proceduralSectionSubmitted: boolean;

    sampleSectionSubmitted: boolean;

    constructor(stepsSubmitted?: Partial<StepsSubmitted> | null) {
        const {
            athleteSectionSubmitted = false,
            authorizationSectionSubmitted = false,
            notificationSectionSubmitted = false,
            proceduralSectionSubmitted = false,
            sampleSectionSubmitted = false,
        } = stepsSubmitted || {};

        this.athleteSectionSubmitted = athleteSectionSubmitted;
        this.authorizationSectionSubmitted = authorizationSectionSubmitted;
        this.notificationSectionSubmitted = notificationSectionSubmitted;
        this.proceduralSectionSubmitted = proceduralSectionSubmitted;
        this.sampleSectionSubmitted = sampleSectionSubmitted;
    }
}
