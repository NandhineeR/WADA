import { Pipe, PipeTransform } from '@angular/core';
import { roundToDecimals } from '@shared/utils/number-utils';

@Pipe({
    name: 'calculatePercentage',
})
export class CalculatePercentagePipe implements PipeTransform {
    transform(value: number, total: number, decimals = 0): string {
        return !value || !total ? Number(0).toFixed(decimals) : roundToDecimals((value / total) * 100, decimals);
    }
}
