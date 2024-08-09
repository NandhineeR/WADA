import { TDPTotals } from './tdp-totals.model';

export class TDPSubRow {
    disciplineId: number;

    disciplineName: string;

    isDirty: boolean;

    isDisabled: boolean;

    isDeleted: boolean; // not in the CAPI model

    tdpTotals: TDPTotals;

    constructor(tdpSubRow?: TDPSubRow) {
        this.disciplineId = tdpSubRow?.disciplineId || 0;
        this.disciplineName = tdpSubRow?.disciplineName || '';
        this.isDirty = tdpSubRow?.isDirty || false;
        this.isDisabled = tdpSubRow?.isDisabled || false;
        this.isDeleted = tdpSubRow?.isDeleted || false;
        this.tdpTotals = tdpSubRow ? new TDPTotals(tdpSubRow.tdpTotals) : new TDPTotals();
    }

    clone(): this {
        const clone = new (this.constructor as typeof TDPSubRow)() as this;
        clone.disciplineName = this.disciplineName;
        clone.disciplineId = this.disciplineId;
        clone.isDirty = this.isDirty;
        clone.isDisabled = this.isDisabled;
        clone.isDeleted = this.isDeleted;
        clone.tdpTotals = this.tdpTotals.clone();

        return clone;
    }

    updateTotals(): void {
        this.tdpTotals.updateTotal();
    }

    setIsDeleted(isDeleted: boolean): void {
        this.isDeleted = isDeleted;
    }
}
