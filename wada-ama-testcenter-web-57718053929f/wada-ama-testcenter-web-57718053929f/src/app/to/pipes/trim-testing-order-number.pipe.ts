import { Pipe, PipeTransform } from '@angular/core';
import { isNullOrBlank } from '@shared/utils';

/*
 * Pipe to go from a TO-number to a TO id ex: TO-12345678 to 12345678
 */
@Pipe({
    name: 'trimToNumber',
})
export class TrimTestingOrderNumberPipe implements PipeTransform {
    transform(toNumber: string): string {
        if (!isNullOrBlank(toNumber) && (toNumber.startsWith('TO') || toNumber.startsWith('M'))) {
            return toNumber.replace(/^\D+/, '');
        }
        return '';
    }
}
