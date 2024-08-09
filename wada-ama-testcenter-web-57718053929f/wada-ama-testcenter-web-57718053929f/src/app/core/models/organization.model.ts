export interface IOrganization {
    id: number;
    shortDescription: string;
    description: string;
    sportFederation: boolean;
    antiDopingOrganization: boolean;
    wada: boolean;
}

export class Organization implements IOrganization {
    id: number;

    shortDescription: string;

    description: string;

    sportFederation: boolean;

    antiDopingOrganization: boolean;

    wada: boolean;

    constructor(organization?: IOrganization) {
        this.id = organization?.id || -1;
        this.shortDescription = organization?.shortDescription || '';
        this.description = organization?.description || '';
        this.sportFederation = organization?.sportFederation || false;
        this.antiDopingOrganization = organization?.antiDopingOrganization || false;
        this.wada = organization?.wada || false;
    }

    get displayName(): string {
        return `${this.shortDescription} - ${this.description}`;
    }
}
