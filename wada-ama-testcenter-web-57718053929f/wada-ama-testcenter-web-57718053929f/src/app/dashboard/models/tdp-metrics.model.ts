export class TDPMetrics {
    // Widget 1
    percentOfActiveADOsWithPlanningForNextYear: number; // % of active ADOs that have at least planned for one sample for next year

    samplesPlannedForNextYear: number; // # of samples planned for next year for user's organization, 0 if no planning

    // Widget 2
    samplesPlannedForCurrentYear: number; // # of samples planned for current year for user's organization, 0 if no planning

    // Widget 3 - Only shown If at least 1 sample planned for current year
    percentageOfNadosWithPlanning: number; // % of NADOs/RADOs that have at least planned for one sample for Current year

    percentageOfPlannedOOCSamples: number; // Avg of % of Out-of-Competition samples completed by NADOs and RADOs for the current year

    constructor(metrics?: TDPMetrics) {
        this.percentOfActiveADOsWithPlanningForNextYear = metrics?.percentOfActiveADOsWithPlanningForNextYear || 0;
        this.samplesPlannedForNextYear = metrics?.samplesPlannedForNextYear || 0;
        this.samplesPlannedForCurrentYear = metrics?.samplesPlannedForCurrentYear || 0;
        this.percentageOfNadosWithPlanning = metrics?.percentageOfNadosWithPlanning || 0;
        this.percentageOfPlannedOOCSamples = metrics?.percentageOfPlannedOOCSamples || 0;
    }
}
