import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'setHas',
})
export class SetHasPipe<T> implements PipeTransform {
    transform(set: Set<T>, key: T): boolean {
        return set.has(key);
    }
}
