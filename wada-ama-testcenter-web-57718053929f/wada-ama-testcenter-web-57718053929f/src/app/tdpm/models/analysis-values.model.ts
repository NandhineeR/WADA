import { TDPMCell } from './tdpm-cell.model';

export class AnalysisValues {
    analysisCategory: string;

    analysisCategoryCode: string;

    inCompetitionPlannedAndCompleteCell: TDPMCell;

    outOfCompetitionPlannedAndCompleteCell: TDPMCell;

    inCompetitionCompleteCell: TDPMCell;

    outOfCompetitionCompleteCell: TDPMCell;

    inCompetitionCompleteWithoutLabResultsCell: TDPMCell;

    outOfCompetitionCompleteWithoutLabResultsCell: TDPMCell;

    constructor(analysis?: AnalysisValues) {
        this.analysisCategory = analysis?.analysisCategory || '';
        this.analysisCategoryCode = analysis?.analysisCategoryCode || '';
        this.inCompetitionPlannedAndCompleteCell = analysis
            ? new TDPMCell(analysis.inCompetitionPlannedAndCompleteCell)
            : new TDPMCell();
        this.inCompetitionCompleteCell = analysis ? new TDPMCell(analysis.inCompetitionCompleteCell) : new TDPMCell();
        this.inCompetitionCompleteWithoutLabResultsCell = analysis
            ? new TDPMCell(analysis.inCompetitionCompleteWithoutLabResultsCell)
            : new TDPMCell();
        this.outOfCompetitionPlannedAndCompleteCell = analysis
            ? new TDPMCell(analysis.outOfCompetitionPlannedAndCompleteCell)
            : new TDPMCell();
        this.outOfCompetitionCompleteCell = analysis
            ? new TDPMCell(analysis.outOfCompetitionCompleteCell)
            : new TDPMCell();
        this.outOfCompetitionCompleteWithoutLabResultsCell = analysis
            ? new TDPMCell(analysis.outOfCompetitionCompleteWithoutLabResultsCell)
            : new TDPMCell();
    }

    clone(): this {
        const clone = new (this.constructor as typeof AnalysisValues)() as this;
        clone.analysisCategory = this.analysisCategory;
        clone.analysisCategoryCode = this.analysisCategoryCode;
        clone.inCompetitionPlannedAndCompleteCell = this.inCompetitionPlannedAndCompleteCell.clone();
        clone.inCompetitionCompleteCell = this.inCompetitionCompleteCell.clone();
        clone.inCompetitionCompleteWithoutLabResultsCell = this.inCompetitionCompleteWithoutLabResultsCell.clone();
        clone.outOfCompetitionPlannedAndCompleteCell = this.outOfCompetitionPlannedAndCompleteCell.clone();
        clone.outOfCompetitionCompleteCell = this.outOfCompetitionCompleteCell.clone();
        clone.outOfCompetitionCompleteWithoutLabResultsCell = this.outOfCompetitionCompleteWithoutLabResultsCell.clone();

        return clone;
    }
}
