import { Pipe, PipeTransform } from '@angular/core';
import { roundToDecimals } from '@shared/utils/number-utils';

@Pipe({
    name: 'round',
})
export class RoundPipe implements PipeTransform {
    transform(value: number, decimals = 0): string {
        return !value ? Number(0).toFixed(decimals) : roundToDecimals(value, decimals);
    }
}
