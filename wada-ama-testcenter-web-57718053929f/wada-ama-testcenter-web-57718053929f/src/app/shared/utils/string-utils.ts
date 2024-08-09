import { latinize } from 'ngx-bootstrap/typeahead';

export { latinize } from 'ngx-bootstrap/typeahead';

export function highlightToken(str: string, token: string): string {
    const latinizedToken = latinize(token.toString().toLocaleLowerCase());
    const latinizedString = latinize(str.toString().toLocaleLowerCase());

    const start = latinizedString.indexOf(latinizedToken);
    const { length } = latinizedToken;

    let itemStr = str;

    if (start >= 0 && length > 0) {
        itemStr = `${str.substring(0, start)}<strong>${str.substring(start, start + length)}</strong>${str.substring(
            start + length
        )}`;
    }
    return itemStr;
}

export const endpointDateFormat = 'YYYY-MM-DD';
export const wadaShortName = 'WADA-AMA';
export const displayDateFormat = 'DD-MMM-YYYY';
export const displayDateFormatFooter = 'dd-MMM-yyyy h:mm a zzzz';

export function concatenateNullableStrings(...str: Array<string | undefined | null>): string {
    return str.reduce<string>((acc, current) => acc + current || '', '');
}

export function isNullOrBlank(str: string | null | undefined): boolean {
    return str ? str.trim() === '' : true;
}

export function removeLastSlash(url: string): string {
    if (url.substring(url.length - 1, url.length) === '/') {
        return url.substring(0, url.length - 1);
    }
    return url;
}

/**
 * Function to build query params from an array of strings given the query param name
 * @param array: Array<string>
 * @param param: string
 * @return The full query param string
 */
export function makeQueryParams(array: Array<string>, param: string): string {
    return array.reduce((previousValue, currentValue) => {
        if (!previousValue) return `${param}=${currentValue}`;
        return `${previousValue}&${param}=${currentValue}`;
    }, '');
}
