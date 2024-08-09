import { isEqual } from 'lodash-es';

export function deepEqual(obj1: any, obj2: any): boolean {
    return isEqual(obj1, obj2);
}

export function isEmpty(obj: any): boolean {
    if (!obj) {
        return true;
    }
    return Object.keys(obj).length === 0;
}

export function propsUndefined(obj: any): boolean {
    if (isEmpty(obj)) {
        return true;
    }
    return !Object.keys(obj).reduce(
        (undef: boolean, prop: string) => undef || (obj[prop] !== undefined && obj[prop] !== null),
        false
    );
}

export function propsUndefinedOrEmpty(obj: any): boolean {
    if (isEmpty(obj)) {
        return true;
    }
    return !Object.keys(obj).reduce(
        (undef: boolean, prop: string) => undef || (obj[prop] !== undefined && obj[prop] !== null && obj[prop] !== ''),
        false
    );
}

export function clone<T>(source: T): T {
    const target = Object.create(Object.getPrototypeOf(source));

    Object.getOwnPropertyNames(source).forEach((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(source, key);
        if (descriptor) {
            if (descriptor.value && descriptor.value instanceof Date) {
                descriptor.value = new Date(descriptor.value);
            } else if (descriptor.value && typeof descriptor.value === 'object') {
                descriptor.value = clone(descriptor.value);
            }
            Object.defineProperty(target, key, descriptor);
        }
    });
    return target;
}

export function objectContains(obj: any, term: string): boolean {
    if (obj === term) return true;
    if (!obj || !term) return false;

    // eslint-disable-next-line no-restricted-syntax
    for (const key in obj) {
        if (deepEqual(obj[key], term)) return true;
    }

    try {
        return obj.displayDescriptionName === term;
    } catch (err) {
        return false;
    }
}
