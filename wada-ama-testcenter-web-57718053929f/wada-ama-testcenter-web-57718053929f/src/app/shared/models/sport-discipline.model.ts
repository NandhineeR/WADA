export class SportDiscipline {
    sportId: number | null;

    sportDescription: string;

    disciplineId: number | null;

    disciplineDescription: string;

    constructor(sportDiscipline?: Partial<SportDiscipline> | null) {
        const { sportId = null, sportDescription = '', disciplineId = null, disciplineDescription = '' } =
            sportDiscipline || {};

        this.sportId = sportId;
        this.sportDescription = sportDescription;
        this.disciplineId = disciplineId;
        this.disciplineDescription = disciplineDescription;
    }

    get displayDescriptionName(): string {
        const sport = (this.sportDescription || '').trim();
        const discipline = (this.disciplineDescription || '').trim();
        return sport && discipline ? `${sport} / ${discipline}` : `${sport}${discipline}`;
    }
}
