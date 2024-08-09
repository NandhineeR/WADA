export class Timezone {
    shortName: string;

    gmtOffset: string;

    id: string;

    constructor(timezone?: Partial<Timezone> | null) {
        const { shortName = '', gmtOffset = '', id = '' } = timezone || {};

        this.shortName = shortName;
        this.gmtOffset = gmtOffset;
        this.id = id;
    }
}
