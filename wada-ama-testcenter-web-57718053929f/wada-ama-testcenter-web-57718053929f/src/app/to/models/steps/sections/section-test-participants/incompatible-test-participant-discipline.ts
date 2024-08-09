import { SportDiscipline } from '@shared/models';

export class IncompatibleTestParticipantDiscipline {
    id: number | null;

    firstName: string;

    lastName: string;

    sportDisciplines: Array<SportDiscipline>;

    displayName: string;

    constructor(incompatibleTestParticipant?: Partial<IncompatibleTestParticipantDiscipline> | null) {
        const { id = null, firstName = '', lastName = '', sportDisciplines = [] } = incompatibleTestParticipant || {};

        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.sportDisciplines = sportDisciplines.map((sport: SportDiscipline) => new SportDiscipline(sport));
        const firstPart = (firstName || '').trim();
        const secondPart = (lastName || '').trim();
        if (secondPart.startsWith(`${firstPart} - `)) this.displayName = `${secondPart}`;
        else this.displayName = firstPart && secondPart ? `${firstPart} - ${secondPart}` : `${firstPart}${secondPart}`;
    }
}
