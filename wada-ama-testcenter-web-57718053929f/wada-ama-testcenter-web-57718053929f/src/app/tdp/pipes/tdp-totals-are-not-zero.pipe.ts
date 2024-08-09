import { Pipe, PipeTransform } from '@angular/core';
import { TDPTotals } from '@tdp/models';

@Pipe({
    name: 'tdpTotalsAreNotZero',
})
export class TDPTotalsAreNotZeroPipe implements PipeTransform {
    transform(totals: TDPTotals): boolean {
        return totals.isNotZero();
    }
}
