import { Country } from './country.model';
import { ListItem } from './list-item.model';

export class Address {
    id: number | null;

    country: Country | null;

    streetAddress1: string;

    streetAddress2: string;

    building: string;

    floor: string;

    room: string;

    city: string;

    region: ListItem | null;

    zipCode: string;

    constructor(address?: Partial<Address> | null) {
        const {
            id = null,
            country = null,
            streetAddress1 = '',
            streetAddress2 = '',
            building = '',
            floor = '',
            room = '',
            city = '',
            region = null,
            zipCode = '',
        } = address || {};

        this.id = id;
        this.country = country ? new Country(country) : null;
        this.streetAddress1 = streetAddress1;
        this.streetAddress2 = streetAddress2;
        this.building = building;
        this.floor = floor;
        this.room = room;
        this.city = city;
        this.region = region ? new ListItem(region) : null;
        this.zipCode = zipCode;
    }
}
