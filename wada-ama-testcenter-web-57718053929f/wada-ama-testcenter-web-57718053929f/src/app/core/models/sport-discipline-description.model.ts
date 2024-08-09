export interface ISportDisciplineDescription {
    disciplineId: number;
    disciplineDescription: string;
    sportId: number;
    sportDescription: string;
    organizationId?: number;
    organizationDescription?: string;
}

export class SportDisciplineDescription implements ISportDisciplineDescription {
    disciplineId: number;

    disciplineDescription: string;

    sportId: number;

    sportDescription: string;

    organizationId?: number;

    organizationDescription?: string;

    constructor(discipline?: ISportDisciplineDescription) {
        this.disciplineId = discipline?.disciplineId || 0;
        this.disciplineDescription = discipline?.disciplineDescription || '';
        this.sportId = discipline?.sportId || 0;
        this.sportDescription = discipline?.sportDescription || '';
        this.organizationId = discipline?.organizationId || 0;
        this.organizationDescription = discipline?.organizationDescription || '';
    }

    get displayName(): string {
        return `${this.sportDescription} - ${this.disciplineDescription}`;
    }
}
