import { TDPTotals } from './tdp-totals.model';
import { TDPSubRow } from './tdp-sub-row.model';
import { SampleValues } from './sample-values.model';
import { AnalysisValues } from './analysis-values.model';

export class TDPRow {
    sportId: number;

    sportName: string;

    tdpTotals: TDPTotals;

    isDisabled: boolean; // not in the CAPI model

    subRows: Array<TDPSubRow>;

    constructor(tdpRow?: TDPRow) {
        this.isDisabled = tdpRow?.isDisabled || false;
        this.sportId = tdpRow?.sportId || 0;
        this.sportName = tdpRow?.sportName || '';
        this.tdpTotals = tdpRow ? new TDPTotals(tdpRow.tdpTotals) : new TDPTotals();
        this.subRows = new Array<TDPSubRow>();

        if (tdpRow) {
            tdpRow.subRows.forEach((subRow: TDPSubRow) => this.subRows.push(new TDPSubRow(subRow)));
        }
    }

    clone(): this {
        const clone = new (this.constructor as typeof TDPRow)() as this;
        clone.sportName = this.sportName;
        clone.sportId = this.sportId;
        clone.isDisabled = this.isDisabled;
        clone.tdpTotals = this.tdpTotals.clone();
        this.subRows.forEach((subRow: TDPSubRow) => clone.subRows.push(subRow.clone()));

        return clone;
    }

    sort(): this {
        this.subRows.sort((a: TDPSubRow, b: TDPSubRow) => a.disciplineName.localeCompare(b.disciplineName));

        return this;
    }

    updateTotals(): void {
        this.tdpTotals.reset();

        this.subRows.forEach((subRow: TDPSubRow) => {
            subRow.updateTotals();
            this.tdpTotals.samples.forEach((sampleTotal: SampleValues) => {
                const sample = subRow.tdpTotals.samples.find(
                    (sampleToFind) => sampleToFind.sampleTypeId === sampleTotal.sampleTypeId
                );
                if (sample) {
                    sampleTotal.inCompetitionCell.value += sample.inCompetitionCell.value;
                    sampleTotal.outOfCompetitionCell.value += sample.outOfCompetitionCell.value;
                }
            });
            this.tdpTotals.analyses.forEach((analysisTotal: AnalysisValues) => {
                const analysis = subRow.tdpTotals.analyses.find(
                    (analysisToFind) => analysisToFind.analysisCategoryCode === analysisTotal.analysisCategoryCode
                );
                if (analysis) {
                    analysisTotal.inCompetitionCell.value += analysis.inCompetitionCell.value;
                    analysisTotal.outOfCompetitionCell.value += analysis.outOfCompetitionCell.value;
                }
            });
        });
        this.tdpTotals.updateTotal();
    }
}
