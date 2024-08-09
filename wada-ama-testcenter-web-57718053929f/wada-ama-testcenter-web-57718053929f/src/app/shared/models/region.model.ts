export class Region {
    id: string;

    name: string;

    constructor(region?: Partial<Region> | null) {
        const { id = '', name = '' } = region || {};

        this.id = id;
        this.name = name;
    }
}
