import { ListItem, SportDiscipline } from '@shared/models';

export class SportIdentity {
    id: number | null;

    endDate: Date | null;

    events: Array<ListItem>;

    internationalFederation: ListItem | null;

    nationalFederation: ListItem | null;

    sportDiscipline: SportDiscipline | null;

    sportTeam: string;

    startDate: Date | null;

    constructor(athlete?: Partial<SportIdentity> | null) {
        const {
            id = null,
            endDate = null,
            events = [],
            internationalFederation = null,
            nationalFederation = null,
            sportDiscipline = null,
            sportTeam = '',
            startDate = null,
        } = athlete || {};

        this.id = id;
        this.endDate = endDate;
        this.events = (events || []).map((event) => new ListItem(event));
        this.internationalFederation = internationalFederation;
        this.nationalFederation = nationalFederation;
        this.sportDiscipline = sportDiscipline;
        this.sportTeam = sportTeam;
        this.startDate = startDate;
    }
}
