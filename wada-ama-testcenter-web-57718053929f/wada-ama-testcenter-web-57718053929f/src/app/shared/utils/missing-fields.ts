import { propsUndefined } from './object-util';

export function fieldMissing(field: any): number {
    if (field === undefined) {
        return 1;
    }
    if (typeof field === 'object') {
        if (field instanceof Date) {
            return 0;
        }
        return +propsUndefined(field);
    }
    return 0;
}
