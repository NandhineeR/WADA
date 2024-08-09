import { TDPMCell } from './tdpm-cell.model';

export class SampleValues {
    sampleTypeId: number;

    sampleType: string;

    inCompetitionPlannedAndCompleteCell: TDPMCell;

    outOfCompetitionPlannedAndCompleteCell: TDPMCell;

    inCompetitionCompleteCell: TDPMCell;

    outOfCompetitionCompleteCell: TDPMCell;

    inCompetitionCompleteWithoutLabResultsCell: TDPMCell;

    outOfCompetitionCompleteWithoutLabResultsCell: TDPMCell;

    constructor(sample?: SampleValues) {
        this.sampleTypeId = sample?.sampleTypeId || 0;
        this.sampleType = sample?.sampleType || '';
        this.inCompetitionPlannedAndCompleteCell = sample
            ? new TDPMCell(sample.inCompetitionPlannedAndCompleteCell)
            : new TDPMCell();
        this.inCompetitionCompleteCell = sample ? new TDPMCell(sample.inCompetitionCompleteCell) : new TDPMCell();
        this.inCompetitionCompleteWithoutLabResultsCell = sample
            ? new TDPMCell(sample.inCompetitionCompleteWithoutLabResultsCell)
            : new TDPMCell();
        this.outOfCompetitionPlannedAndCompleteCell = sample
            ? new TDPMCell(sample.outOfCompetitionPlannedAndCompleteCell)
            : new TDPMCell();
        this.outOfCompetitionCompleteCell = sample ? new TDPMCell(sample.outOfCompetitionCompleteCell) : new TDPMCell();
        this.outOfCompetitionCompleteWithoutLabResultsCell = sample
            ? new TDPMCell(sample.outOfCompetitionCompleteWithoutLabResultsCell)
            : new TDPMCell();
    }

    clone(): this {
        const clone = new (this.constructor as typeof SampleValues)() as this;
        clone.sampleTypeId = this.sampleTypeId;
        clone.sampleType = this.sampleType;
        clone.inCompetitionPlannedAndCompleteCell = this.inCompetitionPlannedAndCompleteCell.clone();
        clone.inCompetitionCompleteCell = this.inCompetitionCompleteCell.clone();
        clone.inCompetitionCompleteWithoutLabResultsCell = this.inCompetitionCompleteWithoutLabResultsCell.clone();
        clone.outOfCompetitionPlannedAndCompleteCell = this.outOfCompetitionPlannedAndCompleteCell.clone();
        clone.outOfCompetitionCompleteCell = this.outOfCompetitionCompleteCell.clone();
        clone.outOfCompetitionCompleteWithoutLabResultsCell = this.outOfCompetitionCompleteWithoutLabResultsCell.clone();

        return clone;
    }
}
