/* eslint-disable prettier/prettier */
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { PhoneNumberUtil } from 'google-libphonenumber';
import * as moment from 'moment';
import { UrineSampleBoundaries } from '@dcf/models';
import { ListItem, Phone } from '@shared/models';
import { OrganizationRelationship } from '@to/models/organization-relationship.model';
import { timeFormatRegex } from './time-format-utils';
import { isNullOrBlank } from './string-utils';
import { isPhoneNumberValid } from './phone-utils';

type Moment = moment.Moment;

const emailPrefixRegex = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))/;
const emailSuffixRegex = /((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
const emailRegex = new RegExp(`^${emailPrefixRegex.source}@${emailSuffixRegex.source}$`);

export const zipCodeRegex = /^[0-9a-z -]*$/i;

export function validateTimeFormat(control: AbstractControl): ValidationErrors | null {
    if (control && control.value && !timeFormatRegex.test(control.value)) {
        return { timeFormat: true };
    }
    return null;
}

export function validateDateRange(minDate: Moment | undefined, maxDate: Moment | undefined): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control || !control.value) {
            return null;
        }

        const date: Moment = moment(control.value).utc(true);
        const isBefore = minDate && date.isBefore(moment(minDate).utc(true).startOf('day'));
        const isAfter = maxDate && date.isAfter(moment(maxDate).utc(true).endOf('day'));

        if (isBefore || isAfter) {
            return {
                dateRange: {
                    maxDate: isAfter,
                    minDate: isBefore,
                },
            };
        }
        return null;
    };
}

export function validateMinDate(minDate: Moment | undefined): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control || !control.value) {
            return null;
        }

        const date: Moment = moment(control.value).utc(true).subtract(moment().utcOffset(), 'minute');
        const isBefore = minDate && date.isBefore(minDate.startOf('day'));

        return isBefore ? { minDate: true } : null;
    };
}

export function validateMaxDate(maxDate: Moment | undefined): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control || !control.value) {
            return null;
        }

        const date: Moment = moment(control.value).utc(true).subtract(moment().utcOffset(), 'minute');
        const isAfter = maxDate && date.isAfter(maxDate.endOf('day'));

        return isAfter ? { maxDate: true } : null;
    };
}

export function validateDateFormat(control: AbstractControl | null): ValidationErrors | null {
    if (!control || !control.value) {
        return null;
    }
    const acceptedFormat = ['DD-MM-YYYY', 'DD-MMM-YYYY'];
    const date: Moment = moment(control.value, acceptedFormat, true);

    if (!date.isValid() && control.value !== undefined && control.value !== null) {
        return {
            validateDateFormat: {
                invalid: true,
            },
        };
    }
    return null;
}

export function dateIsRemoved(control: AbstractControl | null): ValidationErrors | null {
    if (!control) {
        return null;
    }

    if (control.value === null || control.value === undefined) {
        return {
            dateIsRemoved: {
                invalid: true,
            },
        };
    }
    return null;
}

export function validateDatetimeFormat(control: AbstractControl | null): ValidationErrors | null {
    if (!control || !control.value) {
        return null;
    }

    const date = moment.utc(control.value);

    if (!date.isValid() && control.value !== undefined && control.value !== null) {
        return {
            validateDatetimeFormat: {
                invalid: true,
            },
        };
    }
    return null;
}

export function validateCollectionDate(sampleCode: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (control && isNullOrBlank(control?.value?.toString()) && !isNullOrBlank(sampleCode.toString())) {
            return {
                validateEmptyCollectionDate: {
                    invalid: true,
                },
            };
        }
        return null;
    }
}

export function validateTimezone(correlatedField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (control && isNullOrBlank(control?.value?.toString()) && !isNullOrBlank(correlatedField.toString())) {
            return {
                validateEmptyTimezone: {
                    invalid: true,
                },
            };
        }
        return null;
    }
}

export function validatePhoneNumber(control: AbstractControl): ValidationErrors | null {
    if (!control) {
        return null;
    }
    const phone: Phone = control.value;
    const phoneUtil: PhoneNumberUtil = PhoneNumberUtil.getInstance();

    if (phone && phone.phoneNumber) {
        if (!phone.country) {
            return { invalid: true };
        }
        try {
            const extension = phone.extension ? `#${phone.extension}` : '';
            if(!isPhoneNumberValid(phoneUtil, `+${phone.country.telephoneCountryCode}${phone.phoneNumber}${extension}`, phone.country)) {
                return { invalid: true };
            }
        } catch {
            return { invalid: true };
        }
        return null;
    }
    return null;
}

export function fieldRequired(field: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (control && (!control.value || (!control.value[field] && control.value[field] !== false))) {
            return { [`${field}Required`]: true };
        }
        return null;
    };
}

export function validateEmail(control: AbstractControl): ValidationErrors | null {
    if (control && control.value && !emailRegex.test(control.value.toLowerCase())) {
        return { email: true };
    }
    return null;
}

export function validateLowerBound(minVolume: number | null): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (control && control.value && (minVolume == null || parseInt(control.value, 10) < minVolume)) {
            return { invalid: true };
        }
        return null;
    };
}

export function validateSpecificGravityDiluted(
    volume: number,
    urineSampleBoundaries: UrineSampleBoundaries
): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control || !control.value || !urineSampleBoundaries) {
            return null;
        }

        const adjustedValue = parseFloat(`1.0${control.value.toString()}`);

        if (sampleIsDiluted(adjustedValue, volume, urineSampleBoundaries)) {
            return { diluted: true };
        }

        return null;
    };
}

export function sampleIsDiluted(
    specificGravity: number,
    volume: number | null,
    urineSampleBoundaries: UrineSampleBoundaries
): boolean {

    let isDiluted = false;
    if (
        urineSampleBoundaries.minimumVolumeThreshold0 &&
        urineSampleBoundaries.minimumVolumeThreshold1 &&
        urineSampleBoundaries.minimumVolumeThreshold2 &&
        urineSampleBoundaries.minimumSpecificGravityThreshold0 &&
        urineSampleBoundaries.minimumSpecificGravityThreshold1 &&
        urineSampleBoundaries.minimumSpecificGravityThreshold2
    ) {
         // if volume is between minimum and first volume threshold
         if (
            volume !== null &&
            volume >= urineSampleBoundaries.minimumVolumeThreshold0 &&
            volume < urineSampleBoundaries.minimumVolumeThreshold1
        ) {
            // specific gravity must be greater than first SG threshold
            isDiluted = specificGravity < urineSampleBoundaries.minimumSpecificGravityThreshold0;
        }

        // if volume is between first and second volume threshold
        if (
            volume !== null &&
            volume >= urineSampleBoundaries.minimumVolumeThreshold1 &&
            volume < urineSampleBoundaries.minimumVolumeThreshold2
        ) {
            // specific gravity must be greater than first SG threshold
            isDiluted = specificGravity < urineSampleBoundaries.minimumSpecificGravityThreshold1;
        }

        // if volume is greater than or equal to second volume threshold
        if (volume !== null && volume >= urineSampleBoundaries.minimumVolumeThreshold2) {
            // specific gravity must be greater than second SG threshold
            isDiluted = specificGravity < urineSampleBoundaries.minimumSpecificGravityThreshold2;
        }
    }
    return isDiluted;
}

export function fieldNotEmpty(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (control && (!control.value || !control.value.trim())) {
            return { invalid: true };
        }
        return null;
    };
}

export function validateSampleCodeDuplicate(isSampleCodeDuplicate: boolean | null): ValidatorFn {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (_control: AbstractControl): ValidationErrors | null => {
        if (isSampleCodeDuplicate) {
            return { invalid: true };
        }
        return null;
    };
}

// Validates Testing Authority Sharing Rule
export function validateTASharingRuleAccess(
    organizationRelationships: Array<OrganizationRelationship> | [],
    userOrganization: ListItem | null
): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (control && control.value && control.value.id) {
            const testingAuthorityId = control.value.id;
            const matchingOrganization = organizationRelationships.filter(
                (organization) => organization.source && organization.source.id === testingAuthorityId
            );

            return matchingOrganization.length > 0 || (userOrganization && userOrganization.id === control.value.id)
                ? null
                : { isNotSharingTARules: true };
        }
        return null;
    };
}

// Validates creator of Testing Order
export function validateCreatorOfTO(creator: ListItem | null, userOrganization: ListItem | null): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (control && control.value && control.value.id) {
            const isTOcreator =
                (creator && creator.id === control.value.id) ||
                (userOrganization && userOrganization.id === control.value.id);
            return isTOcreator ? null : { isNotCreator: true };
        }
        return null;
    };
}

// Validates service provider of Testing Order
export function validateServiceProvider(
    serviceProviders: Array<ListItem> | [],
    userOrganization: ListItem | null
): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (control && control.value && control.value.id) {
            const matchingServiceProvider = serviceProviders.filter(
                (serviceProvider) =>
                    serviceProvider.id === control.value.id ||
                    (userOrganization && userOrganization.id === control.value.id)
            );
            const isServiceProvider = matchingServiceProvider.length > 0;
            return isServiceProvider ? null : { isNotServiceProvider: true };
        }
        return null;
    };
}
