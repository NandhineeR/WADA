import { TDSSASubRow } from './tdssa-sub-row.model';
import { Totals } from './totals.model';

export class TDSSARow {
    sportName: string;

    totals: Totals;

    subRows: Array<TDSSASubRow>;

    constructor(row?: TDSSARow) {
        this.sportName = row?.sportName || '';
        this.totals = row ? new Totals(row.totals) : new Totals();
        this.subRows = new Array<TDSSASubRow>();

        if (row) {
            row.subRows.forEach((subRow: TDSSASubRow) => this.subRows.push(new TDSSASubRow(subRow)));
        }
    }

    clone(): this {
        const clone = new (this.constructor as typeof TDSSARow)() as this;
        clone.sportName = this.sportName;
        clone.totals = this.totals.clone();
        this.subRows.forEach((subRow: TDSSASubRow) => clone.subRows.push(subRow.clone()));

        return clone;
    }
}
