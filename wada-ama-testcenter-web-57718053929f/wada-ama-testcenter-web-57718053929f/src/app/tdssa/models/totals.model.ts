import { Analysis } from './analysis.model';

export class Totals {
    testTotal: number;

    oocTotal: number;

    totalSamplesUrine: number;

    totalSamplesBlood: number;

    totalSamplesBloodPassport: number;

    totalSamplesDriedBloodSpot: number;

    analyses: Array<Analysis>;

    constructor(totals?: Totals) {
        this.testTotal = (totals ? totals.testTotal : 0) || 0;
        this.oocTotal = (totals ? totals.oocTotal : 0) || 0;
        this.totalSamplesUrine = (totals ? totals.totalSamplesUrine : 0) || 0;
        this.totalSamplesBlood = (totals ? totals.totalSamplesBlood : 0) || 0;
        this.totalSamplesBloodPassport = totals?.totalSamplesBloodPassport || 0;
        this.totalSamplesDriedBloodSpot = totals?.totalSamplesDriedBloodSpot || 0;
        this.analyses = new Array<Analysis>();

        if (totals) {
            totals.analyses.forEach((analysis: Analysis) => this.analyses.push(new Analysis(analysis)));
        }
    }

    clone(): this {
        const clone = new (this.constructor as typeof Totals)() as this;
        clone.testTotal = this.testTotal;
        clone.oocTotal = this.oocTotal;
        clone.totalSamplesUrine = this.totalSamplesUrine;
        clone.totalSamplesBlood = this.totalSamplesBlood;
        clone.totalSamplesBloodPassport = this.totalSamplesBloodPassport;
        clone.totalSamplesDriedBloodSpot = this.totalSamplesDriedBloodSpot;
        this.analyses.forEach((analysis: Analysis) => clone.analyses.push(analysis.clone()));

        return clone;
    }

    reset(): void {
        this.testTotal = 0;
        this.oocTotal = 0;
        this.totalSamplesUrine = 0;
        this.totalSamplesBlood = 0;
        this.totalSamplesBloodPassport = 0;
        this.totalSamplesDriedBloodSpot = 0;
        this.analyses.forEach((analysis) => {
            analysis.total = 0;
            analysis.subCategories.forEach((subCat) => {
                subCat.total = 0;
            });
        });
    }
}
