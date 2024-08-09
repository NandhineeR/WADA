import { trigger } from '@angular/animations';
import { Component, forwardRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FADE_IN_SIMPLE } from '@core/components/animation/animation.component';
import { DropdownComponent, TypeaheadComponent } from '@shared/components';
import { deepEqual } from '@shared/utils/object-util';
import { latinize } from '@shared/utils/string-utils';
import { CountryWithRegions, Phone } from '@shared/models';
import { isPhoneNumberValid } from '@shared/utils';
import { CountryCode } from './country-code';

export const PHONE_INPUT_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PhoneInputComponent),
    multi: true,
};

@Component({
    selector: 'app-phone-input',
    templateUrl: './phone-input.component.html',
    styleUrls: ['./phone-input.component.scss'],
    providers: [PHONE_INPUT_VALUE_ACCESSOR],
    animations: [trigger('fadeInOut', [FADE_IN_SIMPLE])],
})
export class PhoneInputComponent implements ControlValueAccessor, OnChanges {
    @ViewChild('phoneDropDown') phoneDropDown?: DropdownComponent;

    @ViewChild('phoneInput') phoneInput?: TypeaheadComponent;

    @Input() newPhoneNumber = true;

    @Input() hasError = false;

    @Input() hasAsterisk = false;

    @Input() phoneNumberFieldId = 'phoneNumber';

    @Input() phones: Array<Phone> = [];

    @Input() set defaultPhone(defaultPhone: Phone | undefined) {
        this._defaultPhone = new Phone(defaultPhone);
    }

    @Input() isDisabled = false;

    // The country to choose if there is more than one country with the same telephone country code
    @Input() defaultCountrySpecificCode = '';

    @Input() set countries(countries: Array<CountryWithRegions>) {
        this.currentCountryCode = new CountryCode(
            countries.find((country) => country.id === (this.phone.country?.id || undefined))
        );
        this._countries = countries.map((country) => new CountryWithRegions({ ...country, regions: [] }));
    }

    get countries(): Array<CountryWithRegions> {
        return this._countries;
    }

    set phone(value: Phone) {
        const phone = new Phone(value);

        this.currentCountryCode = new CountryCode(
            this.countries.find((country) => country.id === (phone.country?.id || undefined))
        );

        if (!deepEqual(this._phone, phone)) {
            this._phone = new Phone(phone);
            this.hasChanged = true;

            if (!phone.country) {
                const defaultCountry = this.countries.find(
                    (country) => country.specificCode === this.defaultCountrySpecificCode
                );
                if (defaultCountry) {
                    phone.country = defaultCountry;
                    if (this.validatePhone(phone)) {
                        this.currentCountryCode = new CountryCode(defaultCountry);
                        this._phone.country = defaultCountry;
                    }
                }
            }
        }
        this.selectedPhone = this.createPhone(phone);
    }

    get phone(): Phone {
        return this._phone;
    }

    set phoneNumber(phoneNumber: string) {
        this.phone = new Phone({ ...this.phone, phoneNumber });
    }

    get phoneNumber(): string {
        return this.phone.phoneNumber || '';
    }

    set extension(extension: string) {
        this.phone = new Phone({ ...this.phone, extension });
    }

    get extension(): string {
        return this.phone.extension || '';
    }

    currentCountryCode: CountryCode | undefined;

    phoneNumbers: Array<Phone> = [];

    private _phone: Phone = new Phone();

    private _defaultPhone: Phone = new Phone();

    private _countries: Array<CountryWithRegions> = [];

    private onChange: any;

    private onTouched: any;

    private hasChanged = false;

    private hasPhoneSetOnce = false;

    private selectedPhone: Phone = new Phone();

    ngOnChanges(changes: SimpleChanges): void {
        if (
            (changes.phones || changes.countries) &&
            this.phones &&
            this.phones.length > 0 &&
            this.countries &&
            this.countries.length > 0
        ) {
            this.setPhoneNumbers(this.phones);
        }

        this._defaultPhone = this.phones.some((phoneNumber) => this.phoneDeepEqual(phoneNumber, this._defaultPhone))
            ? this.phones.find((phoneNumber) => this.phoneDeepEqual(phoneNumber, this._defaultPhone)) || new Phone()
            : this.phones[0];
        this._defaultPhone = this.createPhone(this._defaultPhone);
        this.writeValue(this._defaultPhone);
    }

    writeValue(phone: Phone): void {
        if (
            phone &&
            phone.phoneNumber &&
            (!this.hasPhoneSetOnce ||
                (this._defaultPhone &&
                    this._defaultPhone.phoneNumber &&
                    this._defaultPhone.phoneNumber !== phone.phoneNumber))
        ) {
            this.phone = new Phone(phone);
            this.hasPhoneSetOnce = true;
        }
    }

    registerOnChange(onChange: any): void {
        this.onChange = onChange;
    }

    registerOnTouched(onTouched: any): void {
        this.onTouched = onTouched;
    }

    countryCodeSuggestions = (token: string): Observable<Array<CountryCode>> => {
        return of(this.countries.map((country) => new CountryCode(country))).pipe(
            map((countries: Array<CountryCode>) =>
                countries.filter(
                    (countryCode) =>
                        latinize(countryCode.description.toLocaleLowerCase()).indexOf(
                            latinize(token.toLocaleLowerCase())
                        ) >= 0
                )
            )
        );
    };

    toggleNewPhoneNumber(newPhone: boolean): void {
        this.newPhoneNumber = newPhone;
        this.currentCountryCode = new CountryCode();
        this.phone = new Phone({ id: this.phone.id, isNewPhone: newPhone });
        this.notify();
        if (newPhone) {
            setTimeout(() => {
                if (this.phoneInput) {
                    this.phoneInput.focus();
                }
            });
        } else {
            setTimeout(() => {
                if (this.phoneDropDown) {
                    this.phoneDropDown.focus();
                }
            });
        }
    }

    selectCountryCode(selected: CountryCode): void {
        this.phone = new Phone({
            ...this.phone,
            country: selected?.country || undefined,
        });
        this.notify();
    }

    selectPhone(phone: Phone): void {
        this.phone = new Phone({ ...phone, id: this.phone.id });
        this.notify();
    }

    notify(): void {
        if (this.hasChanged) {
            if (this.onChange) this.onChange(this.phone);
            if (this.onTouched) this.onTouched();
        }
        this.hasChanged = false;
    }

    setPhoneNumbers(phones: Array<Phone>): void {
        this.phoneNumbers = phones
            ? phones
                  .map((phone) => (phone.country ? phone : this.createPhone(phone)))
                  .filter((phone) => Boolean(phone.phoneNumber))
                  .sort((phone1: Phone, phone2: Phone): number => {
                      let sort = 0;
                      if (phone1.creationDate && phone2.creationDate) {
                          sort = new Date(phone2.creationDate).getTime() - new Date(phone1.creationDate).getTime();
                      }
                      if (phone1.isPrimaryPhone) sort = -1;
                      else if (phone2.isPrimaryPhone) sort = 1;
                      return sort;
                  })
            : [];
        if (
            phones &&
            !this.selectedPhone.isNewPhone &&
            this.selectedPhone.phoneNumber &&
            !this.phoneNumbers.find((phone) => this.phoneDeepEqual(phone, this.selectedPhone))
        ) {
            this.phoneNumbers.push(this.selectedPhone);
        }
        if (this.phoneNumbers.length === 1) {
            [this.selectedPhone] = this.phoneNumbers;
            this.selectPhone(this.selectedPhone);
        }
    }

    validatePhone(phone: Phone): boolean {
        const phoneUtil = PhoneNumberUtil.getInstance();
        try {
            const extension = phone.extension ? `#${phone.extension}` : '';
            return isPhoneNumberValid(phoneUtil, `${phone.toString()}${extension}`, phone.country);
        } catch {
            return false;
        }
    }

    createPhone(phone: Phone): Phone {
        if (phone === null || phone === undefined) {
            return new Phone();
        }
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
            const country = this.getPhoneNumberCountry(phoneNumber);

            if (country && country.telephoneCountryCode) {
                const containCountryCode =
                    phoneNumber.substring(0, country.telephoneCountryCode.length) === country.telephoneCountryCode;
                if (containCountryCode) {
                    phoneNumber = phoneNumber.slice(country.telephoneCountryCode.length);
                }
                const extensionIndex =
                    phoneNumber.indexOf('x') >= 0 ? phoneNumber.indexOf('x') : phoneNumber.indexOf('#');
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

    getPhoneNumberCountry(phoneNumber: string): CountryWithRegions {
        const countries = this.findCountries(phoneNumber);

        return countries && countries.length >= 1
            ? countries.find((country) => country.specificCode === this.defaultCountrySpecificCode) || countries[0]
            : new CountryWithRegions();
    }

    findCountries(phone: string): Array<CountryWithRegions> {
        const phoneUtil = PhoneNumberUtil.getInstance();
        return this.countries.filter((country) => {
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

    phoneDeepEqual(phone1: Phone, phone2: Phone): boolean {
        return (
            phone1 &&
            phone2 &&
            deepEqual(phone1.country, phone2.country) &&
            phone1.phoneNumber === phone2.phoneNumber &&
            phone1.extension === phone2.extension
        );
    }
}
