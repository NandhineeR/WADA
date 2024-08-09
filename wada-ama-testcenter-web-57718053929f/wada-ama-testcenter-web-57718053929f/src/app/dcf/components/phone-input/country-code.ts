import { CountryWithRegions } from '@shared/models';

export class CountryCode {
    description: string;

    country: CountryWithRegions | null;

    constructor(country?: CountryWithRegions) {
        this.description = country ? `${country.name} +${country.telephoneCountryCode}` : '';
        this.country = country || null;
    }
}
