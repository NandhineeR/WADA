import { SampleValues } from './sample-values.model';
import { AnalysisValues } from './analysis-values.model';

export class TDPMTotals {
    plannedAndCompleteSampleTotal: number;

    completeSampleTotal: number;

    completeWithoutLabResultSampleTotal: number;

    samples: Array<SampleValues>;

    analyses: Array<AnalysisValues>;

    constructor(totals?: TDPMTotals) {
        this.plannedAndCompleteSampleTotal = totals?.plannedAndCompleteSampleTotal || 0;
        this.completeSampleTotal = totals?.completeSampleTotal || 0;
        this.completeWithoutLabResultSampleTotal = totals?.completeWithoutLabResultSampleTotal || 0;
        this.analyses = new Array<AnalysisValues>();
        this.samples = new Array<SampleValues>();

        if (totals) {
            totals.analyses.forEach((analysis: AnalysisValues) => this.analyses.push(new AnalysisValues(analysis)));
            totals.samples.forEach((sample: SampleValues) => this.samples.push(new SampleValues(sample)));
        }
    }

    clone(): this {
        const clone = new (this.constructor as typeof TDPMTotals)() as this;
        clone.plannedAndCompleteSampleTotal = this.plannedAndCompleteSampleTotal;
        clone.completeSampleTotal = this.completeSampleTotal;
        clone.completeWithoutLabResultSampleTotal = this.completeWithoutLabResultSampleTotal;
        this.samples.forEach((sample: SampleValues) => clone.samples.push(sample.clone()));
        this.analyses.forEach((analysis: AnalysisValues) => clone.analyses.push(analysis.clone()));

        return clone;
    }

    getSamplesAndAnalysesList(): Array<SampleValues | AnalysisValues> {
        const samplesAnalysesList: Array<SampleValues | AnalysisValues> = [];
        this.samples.forEach((sample) => samplesAnalysesList.push(sample));
        return samplesAnalysesList.concat(this.analyses);
    }

    updateTotal(): void {
        this.plannedAndCompleteSampleTotal = 0;
        this.completeSampleTotal = 0;
        this.completeWithoutLabResultSampleTotal = 0;

        this.samples.forEach((sample: SampleValues) => {
            this.plannedAndCompleteSampleTotal += sample.inCompetitionPlannedAndCompleteCell.actualValue;
            this.plannedAndCompleteSampleTotal += sample.outOfCompetitionPlannedAndCompleteCell.actualValue;
            this.completeSampleTotal += sample.inCompetitionCompleteCell.actualValue;
            this.completeSampleTotal += sample.outOfCompetitionCompleteCell.actualValue;
            this.completeWithoutLabResultSampleTotal += sample.inCompetitionCompleteWithoutLabResultsCell.actualValue;
            this.completeWithoutLabResultSampleTotal +=
                sample.outOfCompetitionCompleteWithoutLabResultsCell.actualValue;
        });
    }

    reset(): void {
        this.plannedAndCompleteSampleTotal = 0;
        this.completeSampleTotal = 0;
        this.completeWithoutLabResultSampleTotal = 0;

        this.samples.forEach((sample: SampleValues) => {
            sample.outOfCompetitionPlannedAndCompleteCell.actualValue = 0;
            sample.outOfCompetitionCompleteCell.actualValue = 0;
            sample.outOfCompetitionCompleteWithoutLabResultsCell.actualValue = 0;
            sample.inCompetitionPlannedAndCompleteCell.actualValue = 0;
            sample.inCompetitionCompleteCell.actualValue = 0;
            sample.inCompetitionCompleteWithoutLabResultsCell.actualValue = 0;
        });

        this.analyses.forEach((analysis: AnalysisValues) => {
            analysis.outOfCompetitionPlannedAndCompleteCell.actualValue = 0;
            analysis.outOfCompetitionCompleteCell.actualValue = 0;
            analysis.outOfCompetitionCompleteWithoutLabResultsCell.actualValue = 0;
            analysis.inCompetitionPlannedAndCompleteCell.actualValue = 0;
            analysis.inCompetitionCompleteCell.actualValue = 0;
            analysis.inCompetitionCompleteWithoutLabResultsCell.actualValue = 0;
        });
    }
}
