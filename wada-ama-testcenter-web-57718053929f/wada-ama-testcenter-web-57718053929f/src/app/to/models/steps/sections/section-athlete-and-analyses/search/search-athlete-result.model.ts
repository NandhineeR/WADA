import { CountryWithRegions, EntityDescription, LocalizedEntity, SportDiscipline } from '@shared/models';
import { getUniqueNumber } from '@shared/utils';
import * as moment from 'moment';
import { TestDuplicate } from '@to/models/test';
import { Athlete } from '@to/models/steps/sections/section-athlete-and-analyses/athlete/athlete.model';
import { Disability } from '@to/models/steps/sections/section-athlete-and-analyses/athlete/disability.model';
import { Team } from '@to/models/team.model';

type Moment = moment.Moment;

export class SearchAthleteResult {
    id: string;

    tempId: string;

    adamsId: string;

    accessible: boolean | null;

    age: number | null;

    bloodPassportIdNumber: string;

    dateOfBirth: Moment | null;

    disabilities: Array<Disability>;

    duplicateTest: TestDuplicate | null;

    firstName: string;

    formerLastName: string;

    gender: string;

    ifIdNumber: string;

    lastName: string;

    latestTest: Date | null;

    naDOIdNumber: string;

    nationalFederations: Array<EntityDescription>;

    nfIdNumber: string;

    originalAthlete: Athlete | null;

    passportCustodian: EntityDescription | null;

    preferredName: string;

    retiredAthlete: boolean | null;

    sportDisciplines: Array<SportDiscipline>;

    sportNationality: CountryWithRegions | null;

    teams: Array<Team>;

    testingPoolTypes: Array<LocalizedEntity>;

    whereaboutsCustodianOrganization: EntityDescription | null;

    athleteId: string;

    constructor(athlete?: Partial<SearchAthleteResult> | null) {
        const {
            id = '',
            tempId = '',
            adamsId = '',
            accessible = null,
            age = null,
            bloodPassportIdNumber = '',
            dateOfBirth = null,
            disabilities = [],
            duplicateTest = null,
            firstName = '',
            formerLastName = '',
            gender = '',
            ifIdNumber = '',
            lastName = '',
            latestTest = null,
            naDOIdNumber = '',
            nationalFederations = [],
            nfIdNumber = '',
            originalAthlete = null,
            passportCustodian = null,
            preferredName = '',
            retiredAthlete = false,
            sportDisciplines = [],
            sportNationality = null,
            teams = [],
            testingPoolTypes = [],
            whereaboutsCustodianOrganization = null,
            athleteId = '',
        } = athlete || {};

        this.id = id;
        this.tempId = tempId !== '' ? tempId : getUniqueNumber().toString();
        this.adamsId = adamsId;
        this.accessible = accessible;
        this.age = age;
        this.bloodPassportIdNumber = bloodPassportIdNumber;
        this.dateOfBirth = dateOfBirth ? moment.utc(dateOfBirth) : null;
        this.disabilities = (disabilities || []).map((disability) => new Disability(disability));
        this.duplicateTest = duplicateTest;
        this.firstName = firstName;
        this.formerLastName = formerLastName;
        this.gender = gender;
        this.ifIdNumber = ifIdNumber;
        this.lastName = lastName;
        this.latestTest = latestTest ? new Date(latestTest) : null;
        this.naDOIdNumber = naDOIdNumber;
        this.nationalFederations = (nationalFederations || []).map(
            (nationalFederation) => new EntityDescription(nationalFederation)
        );
        this.nfIdNumber = nfIdNumber;
        this.athleteId = athleteId;
        this.originalAthlete = originalAthlete ? new Athlete(originalAthlete) : null;
        this.passportCustodian = passportCustodian ? new EntityDescription(passportCustodian) : null;
        this.preferredName = preferredName;
        this.retiredAthlete = retiredAthlete;
        this.sportDisciplines = (sportDisciplines || []).map((discipline) => new SportDiscipline(discipline));
        this.sportNationality = sportNationality;
        this.teams = teams.map((team) => new Team(team));
        this.testingPoolTypes = (testingPoolTypes || []).map((testingPoolType) => new LocalizedEntity(testingPoolType));
        this.whereaboutsCustodianOrganization = whereaboutsCustodianOrganization
            ? new EntityDescription(whereaboutsCustodianOrganization)
            : null;
    }
}
