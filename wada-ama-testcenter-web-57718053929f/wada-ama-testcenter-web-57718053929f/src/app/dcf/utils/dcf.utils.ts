import { DCF } from '@dcf/models';
import { CountryWithRegions, Laboratory, Phone } from '@shared/models';
import { createPhone } from '@shared/utils';
import { isEmpty } from '@shared/utils/object-util';
import { transform, isEqual, isObject, isArray } from 'lodash-es';
import * as moment from 'moment';

export function currentDCFWithDefaultPhone(
    currentDcf: DCF,
    phones: Array<Phone>,
    allCountries: Array<CountryWithRegions>
) {
    if (currentDcf.athlete && !currentDcf.athlete?.phone?.phoneNumber && phones.length && allCountries.length) {
        const defaultPhone = phones.find((phone) => phone.isPrimaryPhone) || phones[0];
        const dcf = new DCF(currentDcf);
        if (dcf.athlete && defaultPhone && currentDcf.athlete.address?.country?.id)
            dcf.athlete.phone =
                createPhone(defaultPhone, allCountries, currentDcf.athlete.address?.country?.id) || null;
        return dcf;
    }
    return currentDcf;
}

/**
 * Deep diff between two object, using lodash
 * @param updatedObject Object compared
 * @param previousObject   Object to compare with
 * @return Return a new object who represent the diff
 */
export function dcfDiff(updatedObject: any, previousObject: any): any {
    function changes(object: any, base: any): any {
        return transform(object, (result: any, value: any, key: string): any => {
            if (key === 'sampleInformation' || !Number.isNaN(Number(key))) {
                const obj = isObject(value) && isObject(base[key]) ? changes(value, base[key]) : value;
                if (!isEmpty(obj)) {
                    result[key] = obj;
                }
            } else if (key === 'samples') {
                const arr =
                    isArray(value) && isArray(base[key]) && value.length === base[key].length
                        ? changes(value, base[key])
                        : value;
                if (arr.length > 0) {
                    result[key] = arr;
                }
            } else if (key === 'collectionDate' || key === 'arrivalDate' || key === 'endOfProcedureDate') {
                const originalDate = base[key] ? moment(base[key]) : null;
                if (!isEqual(value, base[key]) && !isEqual(originalDate?.toString(), value?.toString())) {
                    result[key] = isObject(value) && isObject(base[key]) ? changes(value, base[key]) : value;
                }
            } else if (value instanceof Laboratory) {
                if (!isEqual(value?.id, base[key]?.id)) {
                    result[key] = isObject(value) && isObject(base[key]) ? changes(value, base[key]) : value;
                }
            } else if (
                !isEqual(value, base[key]) &&
                key !== 'displayWitnessChaperoneDescriptionName' &&
                key !== 'guid' &&
                key !== 'sampleType'
            ) {
                result[key] = isObject(value) && isObject(base[key]) ? changes(value, base[key]) : value;
            }
        });
    }
    return changes(updatedObject, previousObject);
}
