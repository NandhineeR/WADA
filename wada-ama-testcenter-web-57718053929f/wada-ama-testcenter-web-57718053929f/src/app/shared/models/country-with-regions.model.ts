import { Region } from './region.model';

export class CountryWithRegions {
    id: string;

    name: string;

    telephoneCountryCode: string;

    specificCode: string;

    regions: Array<Region>;

    constructor(country?: Partial<CountryWithRegions> | null) {
        const { id = '', name = '', telephoneCountryCode = '', specificCode = '', regions = [] } = country || {};

        this.id = id;
        this.name = name;
        this.telephoneCountryCode = telephoneCountryCode;
        this.specificCode = specificCode;
        this.regions = (regions || []).map((r) => new Region(r));
    }
}
