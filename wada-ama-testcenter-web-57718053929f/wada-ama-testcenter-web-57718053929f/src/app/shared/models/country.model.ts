interface ICountry {
    id: string;
    name: string;
}

export class Country implements ICountry {
    id: string;

    name: string;

    constructor(country?: Partial<ICountry> | null) {
        const { id = '', name = '' } = country || {};

        this.id = id;
        this.name = name;
    }
}
