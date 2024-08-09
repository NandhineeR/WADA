export class TDPMMetrics {
    // Widget 1
    samplesCollected: number; // # of samples collected for the current year

    samplesInTDP: number; // # of samples in TDP for current year

    tdpHasValues: boolean; // true if the TDP exists and has values, false otherwise

    // Widget 2
    disciplinesWithCompletedTests: number; // # of disciplines that have at least one test completed for the current year

    disciplinesPlannedToBeTested: number; // Total # of disciplines that were planned to be tested in the current year

    // Widget 3 - Only if user organization is a NADO or RADO and not an IF
    nadosAverage: number; // NADOs average

    percentageOfOOCSamplesCollected: number; // % of OOC samples by current organization for current year

    constructor(metrics?: TDPMMetrics) {
        this.samplesCollected = metrics?.samplesCollected || 0;
        this.samplesInTDP = metrics?.samplesInTDP || 0;
        this.tdpHasValues = metrics?.tdpHasValues || false;
        this.disciplinesWithCompletedTests = metrics?.disciplinesWithCompletedTests || 0;
        this.disciplinesPlannedToBeTested = metrics?.disciplinesPlannedToBeTested || 0;
        this.nadosAverage = metrics?.nadosAverage || 0;
        this.percentageOfOOCSamplesCollected = metrics?.percentageOfOOCSamplesCollected || 0;
    }
}
