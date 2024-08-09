export class Participant {
    activePersonId: number | null;

    firstName: string;

    lastName: string;

    userAccount: boolean;

    constructor(participant?: Partial<Participant> | null) {
        const { activePersonId = null, firstName = '', lastName = '', userAccount = false } = participant || {};

        this.activePersonId = activePersonId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.userAccount = userAccount;
    }
}
