import { isNullOrBlank } from '@shared/utils/string-utils';
import { Address } from './address.model';
import { Participant } from './participant.model';
import { Phone } from './phone.model';
import { SportDiscipline } from './sport-discipline.model';
import { CountryWithRegions } from './country-with-regions.model';

export class Athlete {
    accessible: boolean | null;

    adamsId: string;

    address: Address | null;

    athleteLevel: string;

    bpNumber: string;

    coach: Participant | null;

    coachNotApplicable: boolean | null;

    dateOfBirth: Date | null;

    doctor: Participant | null;

    doctorNotApplicable: boolean | null;

    email: string;

    emailNotProvided: boolean | null;

    firstName: string;

    id: number | null;

    lastName: string;

    phone: Phone | null;

    phoneNumbers: Array<Phone>;

    sex: string;

    sportDiscipline: SportDiscipline | null;

    sportDisciplines: Array<SportDiscipline>;

    sportNationality: CountryWithRegions | null;

    constructor(form?: Partial<Athlete> | null) {
        const {
            accessible = null,
            adamsId = '',
            address = null,
            athleteLevel = '',
            bpNumber = '',
            coach = null,
            coachNotApplicable = null,
            dateOfBirth = null,
            doctor = null,
            doctorNotApplicable = null,
            email = '',
            emailNotProvided = null,
            firstName = '',
            id = null,
            lastName = '',
            phone = null,
            phoneNumbers = [],
            sex = '',
            sportDiscipline = null,
            sportDisciplines = [],
            sportNationality = null,
        } = form || {};

        this.accessible = accessible;
        this.adamsId = adamsId;
        this.address = address ? new Address(address) : null;
        this.athleteLevel = athleteLevel;
        this.bpNumber = bpNumber;
        this.coach = coach ? new Participant(coach) : null;
        this.coachNotApplicable = coachNotApplicable;
        this.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
        this.doctor = doctor ? new Participant(doctor) : null;
        this.doctorNotApplicable = doctorNotApplicable;
        this.email = email;
        this.emailNotProvided = emailNotProvided;
        this.firstName = firstName;
        this.id = id;
        this.lastName = lastName;
        this.phone = phone ? new Phone(phone) : null;
        this.phoneNumbers = (phoneNumbers || []).map((p) => new Phone(p));
        this.sex = sex;
        this.sportDiscipline = sportDiscipline ? new SportDiscipline(sportDiscipline) : null;
        this.sportDisciplines = (sportDisciplines || []).map((s) => new SportDiscipline(s));
        this.sportNationality = sportNationality ? new CountryWithRegions(sportNationality) : null;
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
