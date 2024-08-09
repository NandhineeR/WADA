import { TDPCell } from './tdp-cell.model';

export class AnalysisValues {
    analysisCategory: string;

    analysisCategoryCode: string;

    inCompetitionCell: TDPCell;

    outOfCompetitionCell: TDPCell;

    constructor(analysisValues?: AnalysisValues) {
        this.analysisCategory = analysisValues?.analysisCategory || '';
        this.analysisCategoryCode = analysisValues?.analysisCategoryCode || '';
        this.inCompetitionCell = analysisValues ? new TDPCell(analysisValues.inCompetitionCell) : new TDPCell();
        this.outOfCompetitionCell = analysisValues ? new TDPCell(analysisValues.outOfCompetitionCell) : new TDPCell();
    }

    clone(): this {
        const clone = new (this.constructor as typeof AnalysisValues)() as this;
        clone.analysisCategory = this.analysisCategory;
        clone.analysisCategoryCode = this.analysisCategoryCode;
        clone.inCompetitionCell = this.inCompetitionCell.clone();
        clone.outOfCompetitionCell = this.outOfCompetitionCell.clone();

        return clone;
    }

    add(analysis: AnalysisValues): void {
        this.inCompetitionCell.value += analysis?.inCompetitionCell?.value || 0;
        this.outOfCompetitionCell.value += analysis?.outOfCompetitionCell?.value || 0;
    }
}
