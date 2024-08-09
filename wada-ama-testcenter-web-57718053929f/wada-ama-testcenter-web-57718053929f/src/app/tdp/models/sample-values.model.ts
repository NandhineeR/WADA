import { TDPCell } from './tdp-cell.model';

export class SampleValues {
    sampleTypeId: number;

    sampleType: string;

    inCompetitionCell: TDPCell;

    outOfCompetitionCell: TDPCell;

    constructor(sampleValues?: SampleValues) {
        this.sampleTypeId = sampleValues?.sampleTypeId || 0;
        this.sampleType = sampleValues?.sampleType || '';
        this.inCompetitionCell = sampleValues ? new TDPCell(sampleValues.inCompetitionCell) : new TDPCell();
        this.outOfCompetitionCell = sampleValues ? new TDPCell(sampleValues.outOfCompetitionCell) : new TDPCell();
    }

    clone(): this {
        const clone = new (this.constructor as typeof SampleValues)() as this;
        clone.sampleType = this.sampleType;
        clone.sampleTypeId = this.sampleTypeId;
        clone.inCompetitionCell = this.inCompetitionCell.clone();
        clone.outOfCompetitionCell = this.outOfCompetitionCell.clone();

        return clone;
    }

    add(sample: SampleValues): void {
        this.inCompetitionCell.value += sample?.inCompetitionCell?.value || 0;
        this.outOfCompetitionCell.value += sample?.outOfCompetitionCell?.value || 0;
    }
}
