import { Pipe, PipeTransform } from '@angular/core';
import { Period, TDPSheetInfo } from '@tdp/models';

/*
 * This pipe returns true if the period is a parent period for this tdpSheetInfo,
 * and returns false otherwise.
 */
@Pipe({
    name: 'isParentPeriod',
})
export class IsParentPeriodPipe implements PipeTransform {
    transform(period: Period, tdpSheetInfo: TDPSheetInfo): boolean {
        return period.isGreater(tdpSheetInfo.getPeriod());
    }
}
