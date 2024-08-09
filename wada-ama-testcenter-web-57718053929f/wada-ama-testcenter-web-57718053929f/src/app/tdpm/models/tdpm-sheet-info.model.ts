import { TDPMTotals } from './tdpm-totals.model';
import { TDPMRow } from './tdpm-row.model';
import { AnalysisValues } from './analysis-values.model';
import { SampleValues } from './sample-values.model';

export class TDPMSheetInfo {
    organizationName: string;

    tdpTotals: TDPMTotals;

    rows: Array<TDPMRow>;

    constructor(tdpmSheetInfo?: TDPMSheetInfo) {
        this.organizationName = tdpmSheetInfo?.organizationName || '';
        this.tdpTotals = tdpmSheetInfo ? new TDPMTotals(tdpmSheetInfo.tdpTotals) : new TDPMTotals();
        this.rows = new Array<TDPMRow>();

        if (tdpmSheetInfo) {
            tdpmSheetInfo.rows.forEach((row: TDPMRow) => this.rows.push(new TDPMRow(row)));
        }
    }

    clone(): TDPMSheetInfo {
        const clone = new (this.constructor as typeof TDPMSheetInfo)() as this;
        clone.organizationName = this.organizationName;
        clone.tdpTotals = this.tdpTotals.clone();
        this.rows.forEach((row: TDPMRow) => clone.rows.push(row.clone()));

        return clone;
    }

    updateTotals(): void {
        this.tdpTotals.reset();

        this.rows.forEach((row: TDPMRow) => {
            row.updateTotals();
            // WARNING: here we assume that the samples and the analyses have the same ordering in every TDPTotals
            this.tdpTotals.samples.forEach((sample: SampleValues, index: number) => {
                sample.inCompetitionCompleteCell.actualValue +=
                    row.tdpTotals.samples[index].inCompetitionCompleteCell.actualValue;
                sample.outOfCompetitionCompleteCell.actualValue +=
                    row.tdpTotals.samples[index].outOfCompetitionCompleteCell.actualValue;

                sample.inCompetitionCompleteWithoutLabResultsCell.actualValue +=
                    row.tdpTotals.samples[index].inCompetitionCompleteWithoutLabResultsCell.actualValue;
                sample.outOfCompetitionCompleteWithoutLabResultsCell.actualValue +=
                    row.tdpTotals.samples[index].outOfCompetitionCompleteWithoutLabResultsCell.actualValue;

                sample.inCompetitionPlannedAndCompleteCell.actualValue +=
                    row.tdpTotals.samples[index].inCompetitionPlannedAndCompleteCell.actualValue;
                sample.outOfCompetitionPlannedAndCompleteCell.actualValue +=
                    row.tdpTotals.samples[index].outOfCompetitionPlannedAndCompleteCell.actualValue;
            });
            this.tdpTotals.analyses.forEach((analysis: AnalysisValues, index: number) => {
                analysis.inCompetitionCompleteCell.actualValue +=
                    row.tdpTotals.analyses[index].inCompetitionCompleteCell.actualValue;
                analysis.outOfCompetitionCompleteCell.actualValue +=
                    row.tdpTotals.analyses[index].outOfCompetitionCompleteCell.actualValue;

                analysis.inCompetitionCompleteWithoutLabResultsCell.actualValue +=
                    row.tdpTotals.analyses[index].inCompetitionCompleteWithoutLabResultsCell.actualValue;
                analysis.outOfCompetitionCompleteWithoutLabResultsCell.actualValue +=
                    row.tdpTotals.analyses[index].outOfCompetitionCompleteWithoutLabResultsCell.actualValue;

                analysis.inCompetitionPlannedAndCompleteCell.actualValue +=
                    row.tdpTotals.analyses[index].inCompetitionPlannedAndCompleteCell.actualValue;
                analysis.outOfCompetitionPlannedAndCompleteCell.actualValue +=
                    row.tdpTotals.analyses[index].outOfCompetitionPlannedAndCompleteCell.actualValue;
            });
        });
        this.tdpTotals.updateTotal();
    }
}
