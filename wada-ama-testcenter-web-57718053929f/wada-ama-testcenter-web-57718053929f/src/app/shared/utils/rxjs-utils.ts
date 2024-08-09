import { Observable, OperatorFunction, pipe, UnaryFunction } from 'rxjs';
import { exhaustMap, filter, mapTo, scan, take } from 'rxjs/operators';
import { isNullOrBlank } from './string-utils';

/**
 * Delays emission from the source observable until the input observable emits something
 */
export function delayUntilObservableEmits<T>(observable: Observable<any>): OperatorFunction<T, T> {
    return exhaustMap((input: T) => observable.pipe(take(1), mapTo(input)));
}

/**
 * Filters the undefined state from the type that has either a defined type or undefined.
 */
export function isNotUndefined<T>(type: T | undefined): type is T {
    return type !== undefined;
}

export function isNotNull<T>(type: T | null): type is T {
    return type !== null;
}

export function isNotUndefinedNorNull<T>(type: T | null): type is T {
    return isNotUndefined(type) && isNotNull(type);
}

/**
 * Verify if the Url changes properly
 */
export function filterUrlChanges(): UnaryFunction<Observable<any>, Observable<Array<string>>> {
    return pipe(
        scan(
            (modules: Array<string>, nextModule: any) => [
                modules[1],
                nextModule.routerState.url.substring(0, nextModule.routerState.url.lastIndexOf('#')),
            ],
            ['', '']
        ),
        filter((modules: Array<string>) => {
            // previous and current url doesn't contain links, or hastags
            const urlsHaveNoLink = isNullOrBlank(modules[0]) && isNullOrBlank(modules[1]);
            // one url contains a link, the other doesn't
            const atLeastOneUrlHasLink =
                (isNullOrBlank(modules[0]) && !isNullOrBlank(modules[1])) ||
                (!isNullOrBlank(modules[0]) && isNullOrBlank(modules[1]));
            const noMatchingStrings = modules[0] !== modules[1];
            // both urls have links and they don't match
            const urlsHaveLinkWithNoMatch =
                !isNullOrBlank(modules[0]) && !isNullOrBlank(modules[1]) && noMatchingStrings;
            return urlsHaveNoLink || (!atLeastOneUrlHasLink && noMatchingStrings) || urlsHaveLinkWithNoMatch;
        })
    );
}
