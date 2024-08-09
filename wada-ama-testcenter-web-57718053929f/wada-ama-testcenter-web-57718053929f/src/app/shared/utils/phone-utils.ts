import { CountryWithRegions, Phone } from '@shared/models';
import { PhoneNumberUtil } from 'google-libphonenumber';

export function createPhone(
    phone: Phone,
    allCountries: Array<CountryWithRegions>,
    defaultCountrySpecificCode: string
): Phone {
    if (phone.country) {
        return new Phone({
            ...phone,
            id: undefined,
            country: new CountryWithRegions(phone.country),
        });
    }

    let { phoneNumber = '' } = phone;
    let extension;
    const { creationDate } = phone;
    if (phoneNumber !== null) {
        phoneNumber = phoneNumber.replace('+', '');
        const country = getPhoneNumberCountry(phoneNumber, allCountries, defaultCountrySpecificCode);

        if (country && country.telephoneCountryCode) {
            const containCountryCode =
                phoneNumber.substring(0, country.telephoneCountryCode.length) === country.telephoneCountryCode;
            if (containCountryCode) {
                phoneNumber = phoneNumber.slice(country.telephoneCountryCode.length);
            }
            const extensionIndex = phoneNumber.indexOf('x') >= 0 ? phoneNumber.indexOf('x') : phoneNumber.indexOf('#');
            if (extensionIndex >= 0) {
                extension = phoneNumber.substring(extensionIndex + 1);
                phoneNumber = phoneNumber.slice(0, extensionIndex);
            }
        } else {
            return new Phone();
        }

        return new Phone({
            creationDate,
            country,
            extension,
            phoneNumber,
            isNewPhone: phone.isNewPhone,
            isPrimaryPhone: phone.isPrimaryPhone,
        });
    }

    return new Phone();
}

export function getPhoneNumberCountry(
    phoneNumber: string,
    allCountries: Array<CountryWithRegions>,
    defaultCountrySpecificCode: string
): CountryWithRegions {
    const countries = findCountries(phoneNumber, allCountries);

    return countries && countries.length >= 1
        ? countries.find((country) => country.specificCode === defaultCountrySpecificCode) || countries[0]
        : new CountryWithRegions();
}

export function findCountries(phone: string, countries: Array<CountryWithRegions>): Array<CountryWithRegions> {
    const phoneUtil = PhoneNumberUtil.getInstance();
    return countries.filter((country) => {
        try {
            return (
                isPhoneNumberValid(phoneUtil, phone, country) &&
                phone.substring(0, 3).indexOf(country.telephoneCountryCode) !== -1
            );
        } catch {
            return false;
        }
    });
}

export function isPhoneNumberValid(
    phoneUtil: PhoneNumberUtil,
    phone: string,
    country: CountryWithRegions | null
): boolean {
    const shortCode =
        phoneUtil.getSupportedRegions().indexOf(country?.specificCode || '') !== -1 ? country?.specificCode || '' : '';

    const phoneNumber = phoneUtil.parseAndKeepRawInput(phone, shortCode);

    return phoneUtil.isValidNumberForRegion(phoneNumber, shortCode);
}
