import { Address, ListItem, Phone, SportDiscipline } from '@shared/models';
import { isNullOrBlank } from '@shared/utils/string-utils';
import * as moment from 'moment';

type Moment = moment.Moment;

export class Athlete {
    id: number | null;

    accessible: boolean | null;

    adamsId: string;

    custodialOrganization: ListItem | null;

    dateOfBirth: Moment | null;

    dcfAddress: Address | null;

    dcfPhone: Phone | null;

    email: string;

    firstName: string;

    lastName: string;

    nationalities: Array<ListItem>;

    permanentAddress: Address | null;

    phoneList: Array<Phone>;

    sex: string;

    sportDisciplineList: Array<SportDiscipline>;

    constructor(athlete?: Partial<Athlete> | null) {
        const {
            id = null,
            accessible = null,
            adamsId = '',
            custodialOrganization = null,
            dateOfBirth = null,
            dcfAddress = null,
            dcfPhone = null,
            email = '',
            firstName = '',
            lastName = '',
            nationalities = [],
            permanentAddress = null,
            phoneList = [],
            sex = '',
            sportDisciplineList = [],
        } = athlete || {};

        this.id = id;
        this.accessible = accessible;
        this.adamsId = adamsId;
        this.custodialOrganization = custodialOrganization;
        this.dateOfBirth = dateOfBirth ? moment.utc(dateOfBirth) : null;
        this.dcfAddress = dcfAddress ? new Address(dcfAddress) : null;
        this.dcfPhone = dcfPhone;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.nationalities = (nationalities || []).map((nationality) => new ListItem(nationality));
        this.permanentAddress = permanentAddress ? new Address(permanentAddress) : null;
        this.phoneList = (phoneList || []).map((phone) => new Phone(phone));
        this.sex = sex;
        this.sportDisciplineList = (sportDisciplineList || []).map(
            (sportDiscipline) => new SportDiscipline(sportDiscipline)
        );
    }

    getAthleteFullName(): string {
        let fullName = '';
        fullName = !isNullOrBlank(this.firstName) ? `${this.lastName}, ${this.firstName}` : '';
        if (fullName === ', ') {
            fullName = '';
        }
        return fullName;
    }
}
