import { Pipe, PipeTransform } from '@angular/core';
import { Period, TDPSheet } from '@tdp/models';

/*
 * This pipe returns the first parent or child period causing the disabling of the subRow.
 */
@Pipe({
    name: 'getDisablingPeriod',
})
export class GetDisablingPeriodPipe implements PipeTransform {
    transform(currentPeriod: Period, disciplineId: number, sportId: number, tdpSheet: TDPSheet): Period {
        return tdpSheet.getDisablingPeriod(currentPeriod, disciplineId, sportId);
    }
}
