import { AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { distinctUntilChanged, startWith } from 'rxjs/operators';
import { isNullOrBlank } from './string-utils';

type Moment = moment.Moment;

export function isDateValid(date: any): boolean {
    return date instanceof moment && !Number.isNaN(date.valueOf());
}

export function sameDates(d1: Moment | null, d2: Moment | null): boolean {
    if (d1 && d2) {
        if (!(d1 instanceof moment) || !(d2 instanceof moment)) {
            return true;
        }
        return d1.valueOf() === d2.valueOf();
    }
    if ((!d1 && d2) || (d1 && !d2)) {
        return false;
    }
    return true;
}

// Gets a date, starts with date form value
export function dateObservable(date: AbstractControl): Observable<Moment> {
    return date.valueChanges.pipe(
        startWith(date.value),
        distinctUntilChanged((d1, d2) => sameDates(d1, d2))
    );
}

export function formatDisplayDate(date: Date | Moment | null, utcOffset?: string, format?: string): string {
    const momentDate = date ? moment(date).utc(true) : null;
    let formattedDate = '';
    if (!isNullOrBlank(utcOffset) && !isNullOrBlank(format)) {
        formattedDate = momentDate?.utcOffset(utcOffset || '').format(format) || '';
    } else if (!isNullOrBlank(format)) {
        formattedDate = momentDate?.format(format) || '';
    } else {
        formattedDate = momentDate?.format('DD-MM-YYYY') || '';
    }
    return formattedDate;
}

export function formatDisplayDateWithTimeUTC(date: Date | null): string {
    return date ? moment.utc(date).format('DD-MM-YYYY HH:mm:ssZ') : '';
}

export function formatDisplayDateWithTime(date: Moment | null): string {
    return date ? moment(date).format('DD-MM-YYYY HH:mm') : '';
}

/**
 * Converts date {@link Date} to a utc string format
 * @param date date in {@link Date} format
 * @returns date in string format yyyy-MM-dd like 2020-02-27
 */
export function convertDateToUTCString(date: Date): string {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate();
    return `${y}-${m < 10 ? '0' : ''}${m}-${d < 10 ? '0' : ''}${d}`;
}

/**
 * Converts date {@link Date} to a string format
 * @param date date in {@link Date} format
 * @returns date in string format yyyy-MM-dd like 2020-02-27
 */
export function convertDateToString(date: Date): string {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return `${y}-${m < 10 ? '0' : ''}${m}-${d < 10 ? '0' : ''}${d}`;
}

/**
 * Converts date {@link Moment} to a string format
 * @param date date in {@link Moment} format
 * @returns date in string format yyyy-MM-dd like 2020-02-27
 */
export function convertMomentToString(date: Moment): string {
    const momentDate = moment(date);
    const y = momentDate.utcOffset(0).year();
    const m = momentDate.utcOffset(0).month() + 1;
    const d = momentDate.utcOffset(0).date();
    return `${y}-${m < 10 ? '0' : ''}${m}-${d < 10 ? '0' : ''}${d}`;
}

/**
 * Formats the given date with zero time zone and returns the formatted string.
 * @param date The Moment object representing the date to be formatted.
 * @returns A string representing the formatted date with zero time zone.
 */
export function formatDateWithZeroTimeZone(date: Moment | null): string {
    const time = moment().endOf('day').format('HH:mm:ss');
    return date ? moment(date).format(`ddd MMMM DD YYYY ${time} [GMT+0000]`) : '';
}
