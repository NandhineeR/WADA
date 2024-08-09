import { CountryWithRegions } from '@shared/models';

export class Phone {
    id: string | null;

    country: CountryWithRegions | null;

    phoneNumber: string | null;

    extension: string | null;

    isPrimaryPhone: boolean | null;

    isNewPhone = true;

    creationDate: Date | null;

    constructor(phone?: Partial<Phone> | null) {
        const {
            id = null,
            country = null,
            phoneNumber = null,
            extension = null,
            isPrimaryPhone = null,
            isNewPhone = true,
            creationDate = null,
        } = phone || {};

        this.id = id;
        this.country = country;
        this.phoneNumber = phoneNumber;
        this.extension = extension;
        this.isPrimaryPhone = isPrimaryPhone;
        this.isNewPhone = isNewPhone;
        this.creationDate = creationDate;
    }

    toString(): string {
        return `${this.country?.telephoneCountryCode || ''}${this.phoneNumber}`;
    }
}
