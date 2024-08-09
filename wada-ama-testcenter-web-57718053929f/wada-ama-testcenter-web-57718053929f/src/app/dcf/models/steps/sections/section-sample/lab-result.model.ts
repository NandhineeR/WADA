import { Country, Laboratory, ListItem, Region, SampleType, SportDiscipline } from '@shared/models';

export class LabResult {
    sampleCode: string;

    sampleType?: SampleType | null;

    sport: SportDiscipline | null;

    arrivalDate: string;

    testAuthority: ListItem | null;

    sampleCollectionAuthority: ListItem | null;

    resultManagementAuthority: ListItem | null;

    laboratory: Laboratory | null;

    inCompetition: boolean | null;

    country: Country | null;

    state: Region | null;

    city: string;

    gender: string;

    constructor(result?: Partial<LabResult> | null) {
        const {
            sampleCode = '',
            sampleType = null,
            sport = null,
            arrivalDate = '',
            testAuthority = null,
            sampleCollectionAuthority = null,
            resultManagementAuthority = null,
            laboratory = null,
            inCompetition = null,
            country = null,
            state = null,
            city = '',
            gender = '',
        } = result || {};

        this.sampleCode = sampleCode;
        this.sampleType = sampleType;
        this.sport = sport ? new SportDiscipline(sport) : null;
        this.arrivalDate = arrivalDate;
        this.testAuthority = testAuthority ? new ListItem(testAuthority) : null;
        this.sampleCollectionAuthority = sampleCollectionAuthority ? new ListItem(sampleCollectionAuthority) : null;
        this.resultManagementAuthority = resultManagementAuthority ? new ListItem(resultManagementAuthority) : null;
        this.laboratory = laboratory ? new Laboratory(laboratory) : null;
        this.inCompetition = inCompetition;
        this.country = country || null;
        this.state = state || null;
        this.city = city;
        this.gender = gender;
    }
}
