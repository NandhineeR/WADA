import { Address, CountryWithRegions, Phone, SportDiscipline } from '@shared/models';
import * as moment from 'moment';
import { Disability } from './disability.model';
import { Team } from '../../../../team.model';

type Moment = moment.Moment;

export class Athlete {
    id: number | null;

    accessible: boolean | null;

    dateOfBirth: Moment | null;

    sportNationality: CountryWithRegions | null;

    adamsId: string | undefined;

    address: Address | null;

    email: string;

    phoneNumbers: Array<Phone>;

    sportDisciplines: Array<SportDiscipline>;

    firstName: string;

    lastName: string;

    sex: string;

    teams: Array<Team>;

    disabilities: Array<Disability>;

    constructor(athlete?: Partial<Athlete> | null) {
        const {
            id = null,
            accessible = null,
            dateOfBirth = null,
            sportNationality = null,
            adamsId = '',
            address = null,
            email = '',
            phoneNumbers = [],
            sportDisciplines = [],
            firstName = '',
            lastName = '',
            sex = '',
            disabilities = [],
            teams = [],
        } = athlete || {};

        this.id = id;
        this.accessible = accessible;
        this.dateOfBirth = dateOfBirth ? moment.utc(dateOfBirth) : null;
        this.sportNationality = sportNationality;
        this.adamsId = adamsId;
        this.address = address ? new Address(address) : null;
        this.email = email;
        this.phoneNumbers = (phoneNumbers || []).map((phone) => new Phone(phone));
        this.sportDisciplines = (sportDisciplines || []).map((discipline) => new SportDiscipline(discipline));
        this.firstName = firstName;
        this.lastName = lastName;
        this.sex = sex;
        this.disabilities = disabilities.map((disability) => new Disability(disability));
        this.teams = teams.map((team) => new Team(team));
    }
}
