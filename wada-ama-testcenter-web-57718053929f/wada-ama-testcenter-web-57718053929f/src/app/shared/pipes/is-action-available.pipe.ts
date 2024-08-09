import { Pipe, PipeTransform } from '@angular/core';
import { DCFActionRight } from '@shared/models';

@Pipe({
    name: 'isActionAvailable',
})
export class IsActionAvailablePipe implements PipeTransform {
    transform(actions: Array<string>, neededAction: DCFActionRight): boolean {
        return actions && actions.includes(neededAction);
    }
}
