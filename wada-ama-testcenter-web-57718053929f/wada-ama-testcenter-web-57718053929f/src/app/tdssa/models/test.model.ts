import { Analysis } from './analysis.model';

export class Test {
    testId: string;

    sportNationality: number;

    national: boolean;

    international: boolean;

    other: boolean;

    noAthleteLevel: boolean;

    inCompetition: boolean;

    outOfCompetition: boolean;

    totalSamplesUrine: number;

    totalSamplesBlood: number;

    totalSamplesBloodPassport: number;

    totalSamplesDriedBloodSpot: number;

    analyses: Array<Analysis>;

    // NOSONAR
    constructor(test?: Test) {
        this.testId = test?.testId || '';
        this.sportNationality = test?.sportNationality || 0;
        this.national = test?.national || false;
        this.international = test?.international || false;
        this.other = test?.other || false;
        this.noAthleteLevel = test?.noAthleteLevel || false;
        this.inCompetition = test?.inCompetition || false;
        this.outOfCompetition = test?.outOfCompetition || false;
        this.totalSamplesUrine = test?.totalSamplesUrine || 0;
        this.totalSamplesBlood = test?.totalSamplesBlood || 0;
        this.totalSamplesBloodPassport = test?.totalSamplesBloodPassport || 0;
        this.totalSamplesDriedBloodSpot = test?.totalSamplesDriedBloodSpot || 0;
        this.analyses = new Array<Analysis>();

        if (test) {
            test.analyses.forEach((analysis: Analysis) => this.analyses.push(new Analysis(analysis)));
        }
    }

    clone(): this {
        const clone = new (this.constructor as typeof Test)() as this;
        clone.testId = this.testId;
        clone.sportNationality = this.sportNationality;
        clone.national = this.national;
        clone.international = this.international;
        clone.other = this.other;
        clone.noAthleteLevel = this.noAthleteLevel;
        clone.inCompetition = this.inCompetition;
        clone.outOfCompetition = this.outOfCompetition;
        clone.totalSamplesUrine = this.totalSamplesUrine;
        clone.totalSamplesBlood = this.totalSamplesBlood;
        clone.totalSamplesBloodPassport = this.totalSamplesBloodPassport;
        clone.totalSamplesDriedBloodSpot = this.totalSamplesDriedBloodSpot;
        this.analyses.forEach((analysis: Analysis) => clone.analyses.push(analysis.clone()));

        return clone;
    }
}
