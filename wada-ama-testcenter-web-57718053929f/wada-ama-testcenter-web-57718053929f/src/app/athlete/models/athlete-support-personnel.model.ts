import { PersonType } from './person-type.enum';

export class AthleteSupportPersonnel {
    firstName: string;

    lastName: string;

    sex: string;

    type: PersonType | null;

    constructor(support?: Partial<AthleteSupportPersonnel> | null) {
        const { firstName = '', lastName = '', sex = '', type = null } = support || {};

        this.firstName = firstName;
        this.lastName = lastName;
        this.sex = sex;
        this.type = type;
    }
}
