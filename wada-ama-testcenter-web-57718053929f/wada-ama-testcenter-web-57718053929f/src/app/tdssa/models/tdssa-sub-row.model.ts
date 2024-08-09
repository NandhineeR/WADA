import { Totals } from './totals.model';
import { Test } from './test.model';
import { Analysis } from './analysis.model';

export class TDSSASubRow {
    disciplineName: string;

    totals: Totals;

    tests: Array<Test>;

    constructor(subRow?: TDSSASubRow) {
        this.disciplineName = subRow?.disciplineName || '';
        this.totals = subRow ? new Totals(subRow.totals) : new Totals();
        this.tests = new Array<Test>();

        if (subRow) {
            subRow.tests.forEach((test: Test) => this.tests.push(new Test(test)));
        }
    }

    clone(): this {
        const clone = new (this.constructor as typeof TDSSASubRow)() as this;
        clone.disciplineName = this.disciplineName;
        clone.totals = this.totals.clone();
        this.tests.forEach((test: Test) => clone.tests.push(test.clone()));

        return clone;
    }

    updateTotal(): void {
        this.totals.reset();
        this.tests.forEach((test: Test) => {
            this.totals.testTotal += 1;
            this.totals.oocTotal += test.outOfCompetition ? 1 : 0;
            this.totals.totalSamplesUrine += test.totalSamplesUrine;
            this.totals.totalSamplesBlood += test.totalSamplesBlood;
            this.totals.totalSamplesBloodPassport += test.totalSamplesBloodPassport;
            this.totals.totalSamplesDriedBloodSpot += test.totalSamplesDriedBloodSpot;
            this.totals.analyses.forEach((analysis: Analysis) => analysis.cumulateTotals(test.analyses));
        });
    }
}
