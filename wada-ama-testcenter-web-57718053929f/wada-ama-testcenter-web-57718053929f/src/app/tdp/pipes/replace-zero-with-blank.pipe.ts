import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'replaceZeroWithBlank',
})
export class ReplaceZeroWithBlankPipe implements PipeTransform {
    transform(value: number): string {
        return value === 0 ? '' : value.toString();
    }
}
