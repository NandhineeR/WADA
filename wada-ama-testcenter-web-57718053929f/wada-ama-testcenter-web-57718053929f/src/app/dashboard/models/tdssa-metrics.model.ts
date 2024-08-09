export class TDSSAMetrics {
    // Widget 1
    disciplinesThatMeetMLA: number; // # of disciplines that meet MLA

    disciplinesWithMLA: number; // # of disciplines that have a TDSSA MLA and the ADO has done tests

    // Widget 2
    testsCompletedYearToDate: number; // # of Tests completed on disciplines with a TDSSA MLA, where organization is the TA, year to date.

    // Widget 3 - Only if user organization is a NADO or RADO and not an IF
    nadosAverage: number; // Avg of % of TDSSA Out-of-Competition tests done by NADOs and RADOs for Current year

    percentageOfCompletedOOCSamples: number; // % of completed OOC samples from all disciplines which have a current year MLA

    constructor(metrics?: TDSSAMetrics) {
        this.disciplinesThatMeetMLA = metrics?.disciplinesThatMeetMLA || 0;
        this.disciplinesWithMLA = metrics?.disciplinesWithMLA || 0;
        this.testsCompletedYearToDate = metrics?.testsCompletedYearToDate || 0;
        this.nadosAverage = metrics?.nadosAverage || 0;
        this.percentageOfCompletedOOCSamples = metrics?.percentageOfCompletedOOCSamples || 0;
    }
}
