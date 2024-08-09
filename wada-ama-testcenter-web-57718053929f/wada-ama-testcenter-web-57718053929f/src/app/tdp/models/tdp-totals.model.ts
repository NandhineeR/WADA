import { SampleValues } from './sample-values.model';
import { AnalysisValues } from './analysis-values.model';
import { TDPCell } from './tdp-cell.model';

export class TDPTotals {
    sampleTotal: number;

    samples: Array<SampleValues>;

    analyses: Array<AnalysisValues>;

    constructor(tdpTotals?: TDPTotals) {
        this.sampleTotal = tdpTotals?.sampleTotal || 0;
        this.samples = new Array<SampleValues>();
        this.analyses = new Array<AnalysisValues>();

        if (tdpTotals) {
            tdpTotals.samples.forEach((sample: SampleValues) => this.samples.push(new SampleValues(sample)));
            tdpTotals.analyses.forEach((analysis: AnalysisValues) => this.analyses.push(new AnalysisValues(analysis)));
        }
    }

    clone(): this {
        const clone = new (this.constructor as typeof TDPTotals)() as this;
        clone.sampleTotal = this.sampleTotal;
        this.samples.forEach((sample: SampleValues) => clone.samples.push(sample.clone()));
        this.analyses.forEach((analysis: AnalysisValues) => clone.analyses.push(analysis.clone()));

        return clone;
    }

    add(tdpTotals: TDPTotals): void {
        this.sampleTotal += tdpTotals.sampleTotal;
        this.samples.forEach((sample: SampleValues, index: number) => sample.add(tdpTotals.samples[index]));
        this.analyses.forEach((analysis: AnalysisValues, index: number) => analysis.add(tdpTotals.analyses[index]));
    }

    updateTotal(): void {
        this.sampleTotal = 0;

        this.samples.forEach((sample: SampleValues) => {
            this.sampleTotal += sample.inCompetitionCell.value;
            this.sampleTotal += sample.outOfCompetitionCell.value;
        });
    }

    reset(): void {
        this.sampleTotal = 0;

        this.samples.forEach((sample: SampleValues) => {
            sample.inCompetitionCell.value = 0;
            sample.outOfCompetitionCell.value = 0;
        });

        this.analyses.forEach((analysis: AnalysisValues) => {
            analysis.inCompetitionCell.value = 0;
            analysis.outOfCompetitionCell.value = 0;
        });
    }

    setDirty(dirty: boolean): void {
        this.samples.forEach((sample: SampleValues) => {
            sample.inCompetitionCell.isDirty = dirty;
            sample.outOfCompetitionCell.isDirty = dirty;
        });

        this.analyses.forEach((analysis: AnalysisValues) => {
            analysis.inCompetitionCell.isDirty = dirty;
            analysis.outOfCompetitionCell.isDirty = dirty;
        });
    }

    getCell(id?: number): TDPCell | undefined {
        const sampleIC = this.samples.find((sample: SampleValues) => sample.inCompetitionCell.id === id);
        if (sampleIC) {
            return sampleIC.inCompetitionCell;
        }
        const sampleOC = this.samples.find((sample: SampleValues) => sample.outOfCompetitionCell.id === id);
        if (sampleOC) {
            return sampleOC.outOfCompetitionCell;
        }
        const analysisIC = this.analyses.find((analysis: AnalysisValues) => analysis.inCompetitionCell.id === id);
        if (analysisIC) {
            return analysisIC.inCompetitionCell;
        }
        const analysisOC = this.analyses.find((analysis: AnalysisValues) => analysis.outOfCompetitionCell.id === id);
        if (analysisOC) {
            return analysisOC.outOfCompetitionCell;
        }
        return undefined;
    }

    isNotZero(): boolean {
        let isNotZero = false;
        this.analyses.forEach((analysis) => {
            if (analysis.inCompetitionCell.value > 0) isNotZero = true;
            if (analysis.outOfCompetitionCell.value > 0) isNotZero = true;
        });
        this.samples.forEach((sample) => {
            if (sample.inCompetitionCell.value > 0) isNotZero = true;
            if (sample.outOfCompetitionCell.value > 0) isNotZero = true;
        });
        return isNotZero;
    }
}
