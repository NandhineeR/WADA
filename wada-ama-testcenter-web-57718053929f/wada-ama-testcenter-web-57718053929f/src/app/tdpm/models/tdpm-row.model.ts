import { TDPMTotals } from './tdpm-totals.model';
import { TDPMSubRow } from './tdpm-sub-row.model';
import { AnalysisValues } from './analysis-values.model';
import { SampleValues } from './sample-values.model';

export class TDPMRow {
    sportId: number;

    sportName: string;

    tdpTotals: TDPMTotals;

    subRows: Array<TDPMSubRow>;

    constructor(row?: TDPMRow) {
        this.sportId = row?.sportId || 0;
        this.sportName = row?.sportName || '';
        this.tdpTotals = row ? new TDPMTotals(row.tdpTotals) : new TDPMTotals();
        this.subRows = new Array<TDPMSubRow>();

        if (row) {
            row.subRows.forEach((subRow: TDPMSubRow) => this.subRows.push(new TDPMSubRow(subRow)));
        }
    }

    clone(): this {
        const clone = new (this.constructor as typeof TDPMRow)() as this;
        clone.sportName = this.sportName;
        clone.sportId = this.sportId;
        clone.tdpTotals = this.tdpTotals.clone();
        this.subRows.forEach((subRow: TDPMSubRow) => clone.subRows.push(subRow.clone()));

        return clone;
    }

    updateTotals(): void {
        this.tdpTotals.reset();

        this.subRows.forEach((subRow: TDPMSubRow) => {
            subRow.updateTotals();
            // WARNING: here we assume that the samples and the analyses have the same ordering in every TDPTotals
            this.tdpTotals.samples.forEach((sample: SampleValues, index: number) => {
                sample.inCompetitionCompleteCell.actualValue +=
                    subRow.tdpTotals.samples[index].inCompetitionCompleteCell.actualValue;
                sample.outOfCompetitionCompleteCell.actualValue +=
                    subRow.tdpTotals.samples[index].outOfCompetitionCompleteCell.actualValue;

                sample.inCompetitionCompleteWithoutLabResultsCell.actualValue +=
                    subRow.tdpTotals.samples[index].inCompetitionCompleteWithoutLabResultsCell.actualValue;
                sample.outOfCompetitionCompleteWithoutLabResultsCell.actualValue +=
                    subRow.tdpTotals.samples[index].outOfCompetitionCompleteWithoutLabResultsCell.actualValue;

                sample.inCompetitionPlannedAndCompleteCell.actualValue +=
                    subRow.tdpTotals.samples[index].inCompetitionPlannedAndCompleteCell.actualValue;
                sample.outOfCompetitionPlannedAndCompleteCell.actualValue +=
                    subRow.tdpTotals.samples[index].outOfCompetitionPlannedAndCompleteCell.actualValue;
            });
            this.tdpTotals.analyses.forEach((analysis: AnalysisValues, index: number) => {
                analysis.inCompetitionCompleteCell.actualValue +=
                    subRow.tdpTotals.analyses[index].inCompetitionCompleteCell.actualValue;
                analysis.outOfCompetitionCompleteCell.actualValue +=
                    subRow.tdpTotals.analyses[index].outOfCompetitionCompleteCell.actualValue;

                analysis.inCompetitionCompleteWithoutLabResultsCell.actualValue +=
                    subRow.tdpTotals.analyses[index].inCompetitionCompleteWithoutLabResultsCell.actualValue;
                analysis.outOfCompetitionCompleteWithoutLabResultsCell.actualValue +=
                    subRow.tdpTotals.analyses[index].outOfCompetitionCompleteWithoutLabResultsCell.actualValue;

                analysis.inCompetitionPlannedAndCompleteCell.actualValue +=
                    subRow.tdpTotals.analyses[index].inCompetitionPlannedAndCompleteCell.actualValue;
                analysis.outOfCompetitionPlannedAndCompleteCell.actualValue +=
                    subRow.tdpTotals.analyses[index].outOfCompetitionPlannedAndCompleteCell.actualValue;
            });
        });
        this.tdpTotals.updateTotal();
    }
}
