export class Team {
    id: string;

    name: string;

    constructor(team?: Partial<Team> | null) {
        const { id = '', name = '' } = team || {};

        this.id = id;
        this.name = name;
    }
}
