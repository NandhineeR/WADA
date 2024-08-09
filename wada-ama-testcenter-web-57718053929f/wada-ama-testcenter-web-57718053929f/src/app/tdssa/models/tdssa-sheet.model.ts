import { IsEmpty } from '@shared/models';
import { TDSSARow } from './tdssa-row.model';
import { Totals } from './totals.model';
import { Analysis } from './analysis.model';
import { TDSSASubRow } from './tdssa-sub-row.model';

export class TDSSASheet implements IsEmpty {
    organizationName: string;

    totals: Totals;

    rows: Array<TDSSARow>;

    constructor(tdssaSheet?: TDSSASheet) {
        this.organizationName = tdssaSheet?.organizationName || '';
        this.totals = tdssaSheet ? new Totals(tdssaSheet.totals) : new Totals();
        this.rows = new Array<TDSSARow>();

        if (tdssaSheet) {
            tdssaSheet.rows.forEach((row: TDSSARow) => this.rows.push(new TDSSARow(row)));
        }
    }

    clone(): TDSSASheet {
        const clone = new (this.constructor as typeof TDSSASheet)() as this;
        clone.organizationName = this.organizationName;
        clone.totals = this.totals.clone();
        this.rows.forEach((row: TDSSARow) => clone.rows.push(row.clone()));

        return clone;
    }

    isEmpty(): boolean {
        return this.rows.length === 0;
    }

    updateTotal(): void {
        // recalculate sports values
        this.rows.forEach((row: TDSSARow) => {
            row.totals.reset();
            row.subRows.forEach((subRow: TDSSASubRow) => {
                row.totals.testTotal += subRow.totals.testTotal;
                row.totals.oocTotal += subRow.totals.oocTotal;
                row.totals.totalSamplesBlood += subRow.totals.totalSamplesBlood;
                row.totals.totalSamplesBloodPassport += subRow.totals.totalSamplesBloodPassport;
                row.totals.totalSamplesDriedBloodSpot += subRow.totals.totalSamplesDriedBloodSpot;
                row.totals.totalSamplesUrine += subRow.totals.totalSamplesUrine;

                row.totals.analyses.forEach((analysis: Analysis) => analysis.cumulateTotals(subRow.totals.analyses));
            });
        });

        // recalculate grand total values
        this.totals.reset();
        this.rows.forEach((row: TDSSARow) => {
            this.totals.testTotal += row.totals.testTotal;
            this.totals.oocTotal += row.totals.oocTotal;
            this.totals.totalSamplesUrine += row.totals.totalSamplesUrine;
            this.totals.totalSamplesBlood += row.totals.totalSamplesBlood;
            this.totals.totalSamplesBloodPassport += row.totals.totalSamplesBloodPassport;
            this.totals.totalSamplesDriedBloodSpot += row.totals.totalSamplesDriedBloodSpot;

            this.totals.analyses.forEach((analysis: Analysis) => analysis.cumulateTotals(row.totals.analyses));
        });
    }
}
