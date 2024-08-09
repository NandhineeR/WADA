import { TDPMTotals } from './tdpm-totals.model';

export class TDPMSubRow {
    disciplineId: number;

    disciplineName: string;

    tdpTotals: TDPMTotals;

    constructor(subRow?: TDPMSubRow) {
        this.disciplineId = subRow?.disciplineId || 0;
        this.disciplineName = subRow?.disciplineName || '';
        this.tdpTotals = subRow ? new TDPMTotals(subRow.tdpTotals) : new TDPMTotals();
    }

    clone(): this {
        const clone = new (this.constructor as typeof TDPMSubRow)() as this;
        clone.disciplineName = this.disciplineName;
        clone.disciplineId = this.disciplineId;
        clone.tdpTotals = this.tdpTotals.clone();

        return clone;
    }

    updateTotals(): void {
        this.tdpTotals.updateTotal();
    }
}
