import { getUniqueNumber } from '@shared/utils/unique-number';
import * as moment from 'moment';
import { TestDuplicate } from '@to/models/test';
import { Athlete } from '../athlete/athlete.model';

type Moment = moment.Moment;

export class SearchAthleteRow {
    id: string;

    tempId: string;

    adamsId: string;

    accessible: boolean | null;

    age: number | null;

    analyses: string;

    bloodPassportIdNumber: string;

    canBeSelected: boolean;

    dateOfBirth: Moment | null;

    disabilities: string;

    duplicateTest: TestDuplicate | null;

    formerLastName: string;

    ifIdNumber: string;

    latestTest: Date | null;

    naDOIdNumber: string;

    name: string;

    nationalFederations: string;

    nfIdNumber: string;

    originalAthlete: Athlete | null;

    passportCustodian: string;

    preferredName: string;

    retiredAthlete: string;

    sex: string;

    sportDisciplines: string;

    sportNationality: string;

    teams: string;

    testingPoolTypes: string;

    whereaboutsCustodianOrganization: string;

    athleteIdHeaderAdamsValue: string;

    constructor(athlete?: Partial<SearchAthleteRow> | null) {
        const {
            id = '',
            tempId = '',
            adamsId = '',
            accessible = null,
            age = null,
            analyses = '',
            bloodPassportIdNumber = '',
            canBeSelected = true,
            dateOfBirth = null,
            disabilities = '',
            duplicateTest = null,
            formerLastName = '',
            ifIdNumber = '',
            latestTest = null,
            naDOIdNumber = '',
            name = '',
            nationalFederations = '',
            nfIdNumber = '',
            originalAthlete = null,
            passportCustodian = '',
            preferredName = '',
            retiredAthlete = '',
            sex = '',
            sportDisciplines = '',
            sportNationality = '',
            teams = '',
            testingPoolTypes = '',
            whereaboutsCustodianOrganization = '',
            athleteIdHeaderAdamsValue = '',
        } = athlete || {};

        this.id = id;
        this.tempId = tempId !== '' ? tempId : getUniqueNumber().toString();
        this.adamsId = adamsId;
        this.accessible = accessible;
        this.age = age;
        this.analyses = analyses;
        this.bloodPassportIdNumber = bloodPassportIdNumber;
        this.canBeSelected = canBeSelected;
        this.dateOfBirth = dateOfBirth ? moment.utc(dateOfBirth) : null;
        this.disabilities = disabilities;
        this.duplicateTest = duplicateTest;
        this.formerLastName = formerLastName;
        this.ifIdNumber = ifIdNumber;
        this.latestTest = latestTest ? new Date(latestTest) : null;
        this.naDOIdNumber = naDOIdNumber;
        this.name = name;
        this.nationalFederations = nationalFederations;
        this.nfIdNumber = nfIdNumber;
        this.originalAthlete = originalAthlete ? new Athlete(originalAthlete) : null;
        this.passportCustodian = passportCustodian;
        this.preferredName = preferredName;
        this.retiredAthlete = retiredAthlete;
        this.sex = sex;
        this.sportDisciplines = sportDisciplines;
        this.sportNationality = sportNationality;
        this.teams = teams;
        this.testingPoolTypes = testingPoolTypes;
        this.whereaboutsCustodianOrganization = whereaboutsCustodianOrganization;
        this.athleteIdHeaderAdamsValue = athleteIdHeaderAdamsValue;
    }
}
